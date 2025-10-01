'use client';

import { useEffect, useState, useMemo, useLayoutEffect } from 'react';
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
  Filter,
  Printer,
  Banknote,
  Calendar,
} from 'lucide-react';

// ------------------ Types ------------------
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
  <div className="p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800/70 transition hover:border-indigo-600/50 print:p-0 print:border-none print:shadow-none print:bg-white print:text-gray-900">
    <h2 className="text-xl font-extrabold mb-4 flex items-center gap-3 text-indigo-400 print:text-gray-800 print:border-b print:border-gray-300 print:pb-2 print:mb-2">
      <Icon className="w-6 h-6 text-indigo-500 print:text-gray-500" />
      {title}
    </h2>
    {children}
  </div>
);

// ------------------ Helpers ------------------
const getSeatDisplay = (seat: Booking['seat']) => {
  if (typeof seat === 'string') return seat;
  if (seat && typeof seat === 'object') {
    if (seat.name) return seat.name;
    if (seat.type) return seat.type;
    if (seat.seatNumber) return seat.seatNumber;
  }
  return '—';
};

// ------------------ Main Component ------------------
export default function Report() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<{
    transactionId: string;
    bankName: string;
  } | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [chartKey, setChartKey] = useState(0);

  // Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          'https://abdullah-test.whitescastle.com/api/bookings'
        );
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Reset charts when filters change
  useLayoutEffect(() => {
    setChartKey((prev) => prev + 1);
  }, [startDate, endDate]);

  // ------------------ Filters ------------------
  const finalBookings = useMemo(() => {
    let startTimestamp = 0;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      startTimestamp = start.getTime();
    }

    let endTimestamp = Infinity;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      endTimestamp = end.getTime();
    }

    const filteredByDate = bookings.filter((b) => {
      const bookingTimestamp = new Date(b.createdAt).getTime();
      const isAfterStart = startTimestamp === 0 || bookingTimestamp >= startTimestamp;
      const isBeforeEnd = endTimestamp === Infinity || bookingTimestamp <= endTimestamp;
      return isAfterStart && isBeforeEnd;
    });

    return filteredByDate.filter((b) => {
      const searchLower = search.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(searchLower) ||
        b.showtimeId?.movie?.title?.toLowerCase().includes(searchLower) ||
        b.roomId?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [bookings, search, startDate, endDate]);

  // ------------------ Revenue Data ------------------
  const revenueOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    finalBookings.forEach((b) => {
      if (!b.isCancelled) {
        const date = new Date(b.createdAt).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + b.totalPrice;
      }
    });

    return Object.entries(grouped)
      .map(([isoDate, revenue]) => ({
        date: new Date(isoDate).toLocaleDateString(),
        revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [finalBookings]);

  const revenueByPayment = useMemo(() => {
    const grouped: Record<string, number> = {};
    finalBookings.forEach((b) => {
      if (!b.isCancelled) {
        grouped[b.paymentMethod] =
          (grouped[b.paymentMethod] || 0) + b.totalPrice;
      }
    });
    return Object.entries(grouped).map(([method, value]) => ({
      method,
      value,
    }));
  }, [finalBookings]);

  // ------------------ Summary ------------------
  const summaryStats = useMemo(() => {
    const activeBookings = finalBookings.filter((b) => !b.isCancelled);
    const totalRevenue = activeBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    let filterLabel = 'All Time';
    if (startDate && endDate) {
      filterLabel = `${new Date(startDate).toLocaleDateString()} to ${new Date(
        endDate
      ).toLocaleDateString()}`;
    } else if (startDate) {
      filterLabel = `Since ${new Date(startDate).toLocaleDateString()}`;
    } else if (endDate) {
      filterLabel = `Until ${new Date(endDate).toLocaleDateString()}`;
    }

    return {
      totalRevenue: totalRevenue.toLocaleString(),
      totalTickets: activeBookings.length,
      activeBookings: finalBookings.length,
      cancelledBookings: finalBookings.filter((b) => b.isCancelled).length,
      filterLabel,
    };
  }, [finalBookings, startDate, endDate]);

  // ------------------ Print ------------------
  const handlePrint = () => {
    // Hide print button and date/search inputs before printing
    const hideElements = document.querySelectorAll('.print\\:hidden');
    hideElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const printTitle = `Movie Booking Report (${summaryStats.filterLabel})`;
    const printContent = document.getElementById("bookings-section")?.innerHTML;
    const statsContent = document.getElementById("stats-grid")?.innerHTML;

    if (!printContent) return;

    const newWin = window.open("", "", "width=800,height=600");
    if (newWin) {
      newWin.document.write(`
        <html>
          <head>
            <title>${printTitle}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: sans-serif; padding: 0; color: #333; }
              h2 { font-size: 24px; color: #1a202c; border-bottom: 2px solid #ddd; padding-bottom: 5px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
              th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
              th { background: #f0f4f8; font-weight: bold; color: #4a5568; }
              tr:nth-child(even) { background-color: #f7f7f7; }
              .cancelled { color: #e53e3e; font-weight: bold; }
              .active { color: #38a169; font-weight: bold; }

              /* Print Stats Grid Styling */
              .print-stats-grid { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); 
                gap: 20px; 
                margin-bottom: 30px;
                padding: 10px;
                border: 1px solid #ddd;
              }
              .print-stat-card {
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
                background-color: #f9f9f9;
              }
              .print-stat-card h2 {
                font-size: 16px;
                color: #4c51bf;
                margin-bottom: 5px;
                border-bottom: none;
              }
              .print-stat-card p {
                font-size: 20px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>${printTitle}</h1>
            <div id="stats-grid" class="print-stats-grid">
              <div class="print-stat-card"><h2>Total Revenue</h2><p style="color: #38a169;">PKR ${summaryStats.totalRevenue}</p></div>
              <div class="print-stat-card"><h2>Tickets Sold</h2><p style="color: #4299e1;">${summaryStats.totalTickets}</p></div>
              <div class="print-stat-card"><h2>Active Bookings</h2><p style="color: #805ad5;">${summaryStats.activeBookings}</p></div>
              <div class="print-stat-card"><h2>Cancelled Bookings</h2><p style="color: #e53e3e;">${summaryStats.cancelledBookings}</p></div>
            </div>
            <h2>Bookings Details</h2>
            ${printContent}
          </body>
        </html>
      `);
      newWin.document.close();
      newWin.print();

      // Restore display of hidden elements after print dialog closes
      setTimeout(() => {
        hideElements.forEach(el => (el as HTMLElement).style.removeProperty('display'));
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-semibold text-indigo-400 bg-gray-950">
        Loading Bookings Report...
      </div>
    );
  }

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen p-8 bg-gray-950 text-gray-200">
      {/* Title + Print Button */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text">
          🎬 Movie Booking Reports
        </h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 cursor-pointer rounded-lg text-white font-semibold shadow-lg transition duration-200"
        >
          <Printer className="w-5 h-5" />
          Print Report
        </button>
      </div>

      {/* Summary Grid */}
      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total Revenue" icon={DollarSign}>
          <p className="text-3xl font-bold text-green-400">
            PKR {summaryStats.totalRevenue}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            for period: **{summaryStats.filterLabel}**
          </p>
        </Card>
        <Card title="Tickets Sold" icon={Ticket}>
          <p className="text-3xl font-bold text-blue-400">
            {summaryStats.totalTickets}
          </p>
        </Card>
        <Card title="Active Bookings" icon={ClipboardList}>
          <p className="text-3xl font-bold text-purple-400">
            {summaryStats.activeBookings}
          </p>
        </Card>
        <Card title="Cancelled" icon={Layers}>
          <p className="text-3xl font-bold text-red-400">
            {summaryStats.cancelledBookings}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:hidden">
        <Card title="Revenue Over Time" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300} key={chartKey}>
            <LineChart data={revenueOverTime} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
                labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
                formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366F1" 
                strokeWidth={3} 
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

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
  >
    {revenueByPayment.map((_, idx) => (
      <Cell
        key={`cell-${idx}`}
        fill={['#6366f1', '#10b981', 'white', '#ef4444'][idx % 4]}
      />
    ))}
  </Pie>
  <Tooltip 
    contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "8px" }}
    formatter={(value: number, name: string) => [`PKR ${value.toLocaleString()}`, name]}
  />
  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: 'white' }} />
</PieChart>

          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bookings Table with Filters */}
      <div className="mt-10">
        <h2 className="text-3xl font-extrabold mb-6 text-white flex items-center gap-3">
          <ClipboardList className='w-7 h-7 text-indigo-400'/>
          Bookings Details
        </h2>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800/70 print:hidden">
            <div className='relative flex-grow'>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by Customer, Movie, or Room"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className='flex gap-4'>
              <div className='relative'>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                    title="Start Date"
                />
              </div>
              <div className='relative'>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                    title="End Date"
                />
              </div>
            </div>

            {(startDate || endDate) && (
                <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold shadow-md transition duration-200"
                >
                    <Filter className="w-5 h-5" />
                    Clear Filters
                </button>
            )}
        </div>


        {/* Table Container */}
        <div id="bookings-section" className="overflow-x-auto rounded-xl shadow-2xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Customer</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Movie</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Room</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Seat</th>
                        <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Showtime</th> 
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Price (PKR)</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Payment</th>
                <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider text-indigo-400">Status</th>
              </tr>
            </thead>
     
    <tbody className="bg-gray-900 divide-y divide-gray-600 ">
      {finalBookings.length === 0 ? (
        <tr>
          <td colSpan={9} className="p-4 text-center text-gray-500">
            No bookings found for the applied filters.
          </td>
        </tr>
      ) : (
        finalBookings.map((b, index) => (
          <tr
            key={b._id}
            className={`transition duration-150 ease-in-out ${
              index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
            } hover:bg-gray-700/70`}
          >
            <td className="p-4 whitespace-nowrap font-medium text-gray-100">{b.customerName}</td>
            <td className="p-4 whitespace-nowrap text-gray-300">{b.showtimeId?.movie?.title || '—'}</td>
            <td className="p-4 whitespace-nowrap text-gray-300">{b.roomId?.name || '—'}</td>
            <td className="p-4 whitespace-nowrap text-gray-300">{getSeatDisplay(b.seat)}</td>
            <td className="p-4 whitespace-nowrap text-gray-300">
              {b.showtimeId?.date && b.showtimeId?.time
                ? `${new Date(b.showtimeId.date).toLocaleDateString()} ${b.showtimeId.time}`
                : '—'}
            </td>
            <td className="p-4 whitespace-nowrap font-semibold text-green-400">
              {b.totalPrice.toLocaleString()}
            </td>
        <td className="p-4 whitespace-nowrap">
  {b.transactionId && b.bankName ? (
    <>
      {/* Normal screen view */}
      <button
        onClick={() =>
          setSelectedBank({ transactionId: b.transactionId!, bankName: b.bankName! })
        }
        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer bg-gray-800 p-2 rounded print:hidden"
        title="View Bank Details"
      >
        View Details
      </button>

      {/* Print view (hidden on screen, shown only in print) */}
      <span className="hidden print:inline text-black">
        Bank
      </span>
    </>
  ) : (
    b.paymentMethod
  )}
</td>

           
            <td className="p-4 whitespace-nowrap">
              {b.isCancelled ? (
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-red-900 text-red-300 border border-red-700">
                  Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-green-900 text-green-300 border border-green-700">
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
      </div>

      {/* Bank Modal */}
      {selectedBank && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full relative border border-indigo-600/50 transform transition-all duration-300 scale-100 opacity-100">
            <button
              onClick={() => setSelectedBank(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-2">
              <Banknote className="w-6 h-6"/>
              Bank Transaction Details
            </h3>

            <div className='space-y-4'>
                <div className='p-4 bg-gray-800 rounded-lg'>
                    <p className='text-sm font-semibold text-gray-400 mb-1'>Bank Name</p>
                    <p className="text-lg font-bold text-white">{selectedBank.bankName}</p>
                </div>
                <div className='p-4 bg-gray-800 rounded-lg'>
                    <p className='text-sm font-semibold text-gray-400 mb-1'>Transaction ID</p>
                    <p className="text-lg font-mono text-yellow-400 break-all">{selectedBank.transactionId}</p>
                </div>
            </div>
            
            <button
                onClick={() => setSelectedBank(null)}
                className='mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition'
            >
                Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}