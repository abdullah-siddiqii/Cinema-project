'use client';

import { useEffect, useState, useMemo, useLayoutEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  Layers,
  Search,
  X,
  DollarSign,
  Ticket,
  ClipboardList,
  Printer,
  Banknote,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown, // Add this import
} from 'lucide-react';

// ------------------ Types ------------------

type BookingResponse = {
  success: boolean;
  page: number;
  limit: number;
  totalBookings: number; 
  totalPages: number;
  results: number;
  filter: string;
  bookings: Booking[];
};

type SeatObject = {
  seatNumber?: string;
  name?: string;
  type?: string;
};

type Booking = {
  _id: string;
  customerName: string;
  customerPhone: string;
  seat: string | SeatObject;
  totalPrice: number;
  paymentMethod: string;
  transactionId?: string;
  bankName?: string;
  isCancelled: boolean;
  createdAt: string;
  showtimeId?: { movie: { title: string }; date: string; time: string };
  roomId?: { name: string };
};

// ------------------ Card Component ------------------
const Card = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="p-6 bg-gray-900 rounded-2xl shadow-xl border border-gray-800 transition hover:border-indigo-500/70 print:p-0 print:border-none print:shadow-none print:bg-white print:text-gray-900">
    <h2 className="text-lg font-bold mb-3 flex items-center gap-3 text-indigo-400 print:text-gray-800 print:border-b print:border-gray-300 print:pb-2 print:mb-2">
      <Icon className="w-5 h-5 text-indigo-500 print:text-gray-500" />
      {title}
    </h2>
    {children}
  </div>
);

// ------------------ Global Helpers ------------------
const getSeatDisplay = (seat: Booking['seat']) => {
  if (typeof seat === 'string') return seat;
  if (seat && typeof seat === 'object') {
    if (seat.name) return seat.name;
    if (seat.type) return seat.type;
    if (seat.seatNumber) return seat.seatNumber;
  }
  return '—';
};

const getISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// ------------------ Main Component ------------------
export default function Report() {
  const [dateRange, setDateRange] = useState([
    { 
      startDate: new Date(2000, 0, 1), 
      endDate: new Date(), 
      key: 'selection' 
    },
  ]);
  
  // ------------------ State Management ------------------
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summaryBookings, setSummaryBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<{
    transactionId: string;
    bankName: string;
  } | null>(null);

  // Pagination & Data Size State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0); 

  // Filter State
  const [activeFilter, setActiveFilter] = useState<'Today' | 'This Week' | 'This Month' | 'All Time' | 'Custom'>('All Time');
  
  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [datePickerPosition, setDatePickerPosition] = useState<'below' | 'above'>('below');
  const printRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const limitDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce for Search input 
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const lastFetchedSearch = useRef(''); 
  const lastFetchedFilter = useRef(activeFilter); 

  // Available limit options
  const limitOptions = [10, 25, 50, 100, 250, 500, 1000];

  // Filter handlers
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Calculate date picker position and close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close date picker
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      // Close limit dropdown
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target as Node)) {
        setShowLimitDropdown(false);
      }
    };

    const calculatePosition = () => {
      if (dateButtonRef.current && showDatePicker) {
        const buttonRect = dateButtonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const datePickerHeight = 400; // Approximate height of date picker
        
        if (spaceBelow < datePickerHeight && spaceAbove > spaceBelow) {
          setDatePickerPosition('above');
        } else {
          setDatePickerPosition('below');
        }
      }
    };

    if (showDatePicker || showLimitDropdown) {
      if (showDatePicker) {
        calculatePosition();
      }
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [showDatePicker, showLimitDropdown]);

  // ------------------ Helper Functions ------------------

  // Format date for display
  const formatDateRangeDisplay = () => {
    if (activeFilter === 'Custom' && dateRange[0].startDate && dateRange[0].endDate) {
      const start = format(dateRange[0].startDate, 'MMM dd, yyyy');
      const end = format(dateRange[0].endDate, 'MMM dd, yyyy');
      return `${start} - ${end}`;
    }
    return activeFilter;
  };

  const getButtonClass = (period: 'Today' | 'This Week' | 'This Month' | 'All Time') =>
    `px-4 py-2 text-sm font-semibold rounded-full transition duration-200 flex-shrink-0 border ${
      activeFilter === period
      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700'
      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
    }`;

  // ------------------ Handlers ------------------

  const handleQuickFilter = (period: 'Today' | 'This Week' | 'This Month' | 'All Time') => {
    setActiveFilter(period);
    const today = new Date();

    switch (period) {
      case 'Today':
        setDateRange([{ 
          startDate: today, 
          endDate: today, 
          key: 'selection' 
        }]);
        break;
      case 'This Week':
        // This week starting from today (Monday to Sunday)
        setDateRange([{ 
          startDate: today, 
          endDate: addDays(today, 6), 
          key: 'selection' 
        }]);
        break;
      case 'This Month':
        setDateRange([{ 
          startDate: startOfMonth(today), 
          endDate: endOfMonth(today), 
          key: 'selection' 
        }]);
        break;
      case 'All Time':
        setDateRange([{ 
          startDate: new Date(2000, 0, 1), 
          endDate: today, 
          key: 'selection' 
        }]);
        break;
    }
    
    setShowDatePicker(false);
    setCurrentPage(1);
    setSearch('');
    setDebouncedSearch('');
  };

  const handleDateRangeChange = (ranges: any) => {
    const selection = ranges.selection;
    setDateRange([
      {
        startDate: selection.startDate || new Date(),
        endDate: selection.endDate || new Date(),
        key: 'selection',
      },
    ]);
    // Automatically apply custom filter when date range changes
    setActiveFilter('Custom');
    setCurrentPage(1);
  };

  const handleDatePickerToggle = () => {
    if (!showDatePicker) {
      // Calculate position before opening
      if (dateButtonRef.current) {
        const buttonRect = dateButtonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const datePickerHeight = 400;
        
        if (spaceBelow < datePickerHeight && spaceAbove > spaceBelow) {
          setDatePickerPosition('above');
        } else {
          setDatePickerPosition('below');
        }
      }
    }
    setShowDatePicker(!showDatePicker);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
    setShowLimitDropdown(false);
  };

  const handleLimitDropdownToggle = () => {
    setShowLimitDropdown(!showLimitDropdown);
  };

  // Handler for pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ------------------ Data Fetching Functions ------------------

  // Function to build API parameters
  const buildApiParams = (forSummary: boolean = false) => {
    const params = new URLSearchParams();
    
    if (!forSummary) {
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
    } else {
      params.append('limit', '1000');
      params.append('page', '1');
    }
    
    // Add date range to API parameters - ALWAYS send dates
    if (dateRange[0].startDate && dateRange[0].endDate) {
      params.append('startDate', getISODate(dateRange[0].startDate));
      params.append('endDate', getISODate(dateRange[0].endDate));
    }
    
    // Add search term if available
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    
    // Add active filter name for tracking
    if (activeFilter !== 'Custom') {
      params.append('filter', activeFilter);
    } else {
      params.append('filter', 'Custom');
    }

    console.log('API Params:', params.toString()); // Debug log

    return params;
  };

  // Separate function for fetching the summary data
  const fetchSummaryBookings = useCallback(async () => {
    const params = buildApiParams(true);
    const apiUrl = `https://abdullah-test.whitescastle.com/api/bookings?${params.toString()}`;

    try {
      const res = await fetch(apiUrl);
      const data: BookingResponse = await res.json();
      
      if (data.success) {
        setSummaryBookings(data.bookings);
      } else {
        setSummaryBookings([]);
        console.error('API Summary Error:', data);
      }
    } catch (err) {
      console.error('Error fetching summary bookings:', err);
      setSummaryBookings([]);
    }
  }, [activeFilter, debouncedSearch, dateRange]);

  // Separate function for fetching the paginated data
  const fetchPaginatedBookings = useCallback(async () => {
    setLoading(true);

    const params = buildApiParams(false);
    const apiUrl = `https://abdullah-test.whitescastle.com/api/bookings?${params.toString()}`;

    try {
      const res = await fetch(apiUrl);
      const data: BookingResponse = await res.json();

      if (data.success) {
        setBookings(data.bookings);
        setTotalPages(data.totalPages);
        setTotalBookingsCount(data.totalBookings);
        setCurrentPage(data.page); 
        lastFetchedSearch.current = debouncedSearch;
        lastFetchedFilter.current = activeFilter;
      } else {
        console.error('API Error:', data);
        setBookings([]);
        setTotalPages(1);
        setTotalBookingsCount(0);
      }
    } catch (err) {
      console.error('Error fetching paginated bookings:', err);
      setBookings([]);
      setTotalPages(1);
      setTotalBookingsCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, currentPage, limit, dateRange]);

  // ------------------ Primary Fetch Effect ------------------
  // Load data automatically when component mounts
  useEffect(() => {
    fetchPaginatedBookings();
    fetchSummaryBookings();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchPaginatedBookings();
    fetchSummaryBookings();
  }, [activeFilter, debouncedSearch, dateRange, currentPage, limit]);

  // ------------------ Data Processing ------------------
  
  const finalBookings = bookings; 
  const chartAndSummaryData = summaryBookings;

  useLayoutEffect(() => {
     setChartKey((prev) => prev + 1); 
  }, [chartAndSummaryData]);

  const revenueOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    chartAndSummaryData.forEach((b) => {
        if (!b.isCancelled) {
            const date = getISODate(new Date(b.createdAt));
            grouped[date] = (grouped[date] || 0) + b.totalPrice;
        }
    });

    return Object.entries(grouped)
        .map(([isoDate, revenue]) => ({
            date: new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            revenue,
            sortDate: new Date(isoDate).getTime()
        }))
        .sort((a, b) => a.sortDate - b.sortDate);
  }, [chartAndSummaryData]);

  const revenueByPayment = useMemo(() => {
    const grouped: Record<string, number> = {};
    chartAndSummaryData.forEach((b) => {
        if (!b.isCancelled) {
            grouped[b.paymentMethod] = (grouped[b.paymentMethod] || 0) + b.totalPrice;
        }
    });
    return Object.entries(grouped)
        .filter(([, value]) => value > 0)
        .map(([method, value]) => ({ method, value }));
  }, [chartAndSummaryData]);const summaryStats = useMemo(() => {
  const allBookingsForFilter = chartAndSummaryData;

  if (!allBookingsForFilter || allBookingsForFilter.length === 0) {
    return {
      totalRevenue: "0",
      activeRevenue: "0",
      cancelledRevenue: "0",
      activeBookings: 0,
      cancelledBookings: 0,
      filterLabel: activeFilter === "Custom" ? formatDateRangeDisplay() : activeFilter,
      totalTickets: totalBookingsCount,
    };
  }

  // Separate active and cancelled bookings
  const cancelledBookingsArr = allBookingsForFilter.filter((b) => b.isCancelled);
  const activeBookingsArr = allBookingsForFilter.filter((b) => !b.isCancelled);

  // Calculate total revenue (all bookings)
  const totalRevenue = Number(
    allBookingsForFilter
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)
      .toFixed(1)
  );

  // Active revenue
  const activeRevenue = Number(
    activeBookingsArr
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)
      .toFixed(1)
  );

  // Cancelled revenue
  const cancelledRevenue = Number(
    cancelledBookingsArr
      .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0)
      .toFixed(1)
  );

  return {
    totalRevenue: totalRevenue.toLocaleString(),
    activeRevenue: activeRevenue.toLocaleString(),
    cancelledRevenue: cancelledRevenue.toLocaleString(),
    activeBookings: activeBookingsArr.length,
    cancelledBookings: cancelledBookingsArr.length,
    filterLabel: activeFilter === "Custom" ? formatDateRangeDisplay() : activeFilter,
    totalTickets: totalBookingsCount,
  };
}, [chartAndSummaryData, activeFilter, totalBookingsCount]);


  // ------------------ Print Setup ------------------
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Movie Booking Report (${summaryStats.filterLabel})`,
  });

  // ------------------ Loading State ------------------
  if (loading && totalBookingsCount === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-semibold text-indigo-400 bg-gray-950">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Bookings Report...
      </div>
    );
  }

  // ------------------ UI Rendering ------------------
  return (
    <>
      <div className="h-full  overflow-hidden h[calc(100vh-79px)] p-8 bg-gray-950 scrollbar-y text-gray-200 print-area-container overflow-y-auto">

        {/* Title + Print Button */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            🎬 Movie Booking Reports
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold shadow-lg transition duration-200"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </button>
        </div>

        {/* PRINT TARGET START */}
        <div ref={printRef} className="print-target-content p-0 m-0">
          
          {/* Print Title */}
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900 hidden print:block print-title">
            Movie Booking Report <span className='text-lg font-normal text-gray-600'>({summaryStats.filterLabel})</span>
          </h1>

          {/* Summary Grid */}
          <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 stats-grid">

            <Card title="Total Revenue (Active)" icon={DollarSign}>
              <p className="text-3xl font-extrabold text-green-400">PKR {summaryStats.totalRevenue}</p>
              <p className="text-sm text-red-400 mt-2"> Canceled Revenue ({summaryStats.cancelledRevenue})</p>
            </Card>
            <Card title="Total Bookings " icon={Ticket}>
              <p className="text-4xl font-extrabold text-blue-400">{summaryStats.totalTickets}</p>
              <p className="text-sm text-gray-400 mt-2">Total bookings both active and cancelled</p>
            </Card>
            <Card title="Active Bookings" icon={ClipboardList}>
              <p className="text-4xl font-extrabold text-purple-400">{summaryStats.activeBookings} </p>
              <p className="text-sm text-gray-400 mt-2">Active tickets according to data</p>
            </Card>
            <Card title="Cancelled Bookings" icon={Layers}>
              <p className="text-4xl font-extrabold text-red-400">{summaryStats.cancelledBookings}</p>
              <p className="text-sm text-gray-400 mt-2">Cancelled tickets according to data</p>
            </Card>
          </div>

          {/* Charts Section */}
          <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 print:hidden">
            <div className='lg:col-span-2'>
              <Card title="Revenue Over Time" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300} key={chartKey}>
                  <LineChart data={revenueOverTime} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(value: number) => `PKR ${value.toLocaleString()}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }} formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card title="Revenue by Payment Method" icon={CreditCard}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByPayment}
                    dataKey="value"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ method, percent }) => `${method} (${((percent as number) * 100).toFixed(0)}%)`}
                    stroke="#111827"
                    strokeWidth={2}
                    paddingAngle={3}
                  >
                    {revenueByPayment.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} formatter={(value: number, name: string) => [`PKR ${value.toLocaleString()}`, name]} labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ color: 'white', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Bookings Table with Filters */}
          <div className="mt-10">
            <h2 className="text-3xl font-extrabold mb-6 text-white flex items-center gap-3 print:hidden">
              <ClipboardList className="w-7 h-7 text-indigo-400" />
              Bookings Details
            </h2>

            {/* Filters and Search Bar */}
            <div id="filter-bar" className="flex flex-col gap-4 mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800/70 print:hidden">
              <div className="flex gap-3 justify-start overflow-x-auto pb-2">
                <span className="text-gray-400 flex items-center pr-2 font-semibold text-sm whitespace-nowrap">
                  <Filter className="w-4 h-4 mr-1 text-indigo-400" /> Quick Filters:
                </span>
                <button onClick={() => handleQuickFilter('Today')} className={getButtonClass('Today')}  style={{"cursor": "pointer"}}>Today</button>
                <button onClick={() => handleQuickFilter('This Week')} className={getButtonClass('This Week')} style={{"cursor": "pointer"}}>This Week</button>
                <button onClick={() => handleQuickFilter('This Month')} className={getButtonClass('This Month')} style={{"cursor": "pointer"}}>This Month</button>
                <button onClick={() => handleQuickFilter('All Time')} className={getButtonClass('All Time')} style={{"cursor": "pointer"}}>All Time</button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by Customer, Movie or Room"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="relative" ref={datePickerRef}>
                  {/* Calendar Toggle Button */}
                  <button
                    ref={dateButtonRef}
                    onClick={handleDatePickerToggle}
                    className="px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 min-w-[200px] justify-center"
                    title='Click to select custom date range or more filters'
                    >
                    <Calendar className="w-5 h-5" /> 
                    {formatDateRangeDisplay()}
                  </button>
                    

                  {/* Date Range Picker Popup */}
                  {showDatePicker && (
                    <div className={`absolute right-0 z-50 bg-gray-900 border border-indigo-500 rounded-lg shadow-2xl overflow-hidden p-4 ${
                      datePickerPosition === 'above' 
                        ? 'bottom-full mb-2' 
                        : 'top-full mt-2'
                    }`}>
                      <DateRangePicker
                        ranges={dateRange}
                        onChange={handleDateRangeChange}
                        maxDate={new Date()}
                        editableDateInputs={true}
                        direction="horizontal"
                        months={1}
                        moveRangeOnFirstSelection={false}
                        rangeColors={['#6366F1']}
                        showDateDisplay={false}
                        showPreview={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div id="bookings-table-container" className="overflow-x-auto rounded-xl shadow-2xl border border-gray-700 bg-gray-700 print:shadow-none print:border-none print:bg-white">
              <table id="bookings-table" className="min-w-full divide-y divide-gray-700 print:divide-gray-300">
                <thead className="bg-gray-800 text-indigo-200 print:bg-gray-100 print:text-gray-700">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Customer</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Movie</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Room</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Seat</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Showtime</th>
                    <th className="p-4 text-right text-sm font-semibold uppercase tracking-wider">Price (PKR)</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Payment</th>
                    <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>

                <tbody className="bg-gray-900 divide-y divide-gray-800 print:bg-white print:divide-gray-200">
                  {finalBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-gray-400 print:text-gray-600">
                        No bookings found for the applied filters.
                      </td>
                    </tr>
                  ) : (
                    finalBookings.map((b) => (
                      <tr key={b._id} className="text-white hover:bg-gray-800 ...">
                        <td className="p-4 whitespace-nowrap font-medium">{b.customerName}</td>
                        <td className="p-4 whitespace-nowrap">{b.showtimeId?.movie?.title || '—'}</td>
                        <td className="p-4 whitespace-nowrap">{b.roomId?.name || '—'}</td>
                        <td className="p-4 whitespace-nowrap text-indigo-300">{getSeatDisplay(b.seat)}</td>
                        <td className="p-4 whitespace-nowrap text-sm">
                          {b.showtimeId?.date && b.showtimeId?.time
                            ? `${new Date(b.showtimeId.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} @ ${b.showtimeId.time}`
                            : '—'}
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold text-right text-green-400">{b.totalPrice.toLocaleString()}</td>
                        <td className="p-4 whitespace-nowrap text-sm">{b.paymentMethod}</td>
                        <td className="p-4 whitespace-nowrap">
                          {b.isCancelled ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-red-700/30 text-red-300">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-green-700/30 text-green-300">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-2 p-4 print:hidden bg-gray-900 rounded-xl border border-gray-800 ">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-400">
                  Showing ({finalBookings.length}) items on this page. Total bookings found: ({totalBookingsCount.toLocaleString()})
                </p>
                
                {/* Records per page selector */}
                <div className="relative" ref={limitDropdownRef}>
                  <button
                    onClick={handleLimitDropdownToggle}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                  >
                    <span>Show: {limit}</span>

                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showLimitDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[100px]">
                      {limitOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleLimitChange(option)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-indigo-600 hover:text-white transition ${
                            limit === option 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading} 
                  className="p-2 rounded-full  cursor-pointer bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:hover:bg-gray-800 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 rounded-full cursor-pointer bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:hover:bg-gray-800 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
          {/* PRINT TARGET END */}
        </div>

        {/* Bank Details Modal */}
        {selectedBank && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 modal-overlay print:hidden">
            <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-indigo-600/50 transform scale-100 opacity-100">
              <button onClick={() => setSelectedBank(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <Banknote className="w-6 h-6" /> Bank Transfer Details
              </h3>
              <div className="space-y-3">
                <p className="text-gray-300"><strong>Bank Name:</strong> <span className="text-white">{selectedBank.bankName}</span></p>
                <p className="text-gray-300"><strong>Transaction ID:</strong> <span className="text-white break-all">{selectedBank.transactionId}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}