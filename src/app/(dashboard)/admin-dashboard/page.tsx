'use client';

import HomeWrapper from '@/components/HomeWrapper';
import Sidebar from '@/components/Sidebar';
import React, { useEffect, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';

// Define the shape of the data
type StatsData = {
  totalBookings: number;
  totalBookingsToday: number;
  cancelledRevenue: number;
  totalRevenue: number;
  cancelledBookings: number;
  activeMovies: number;
  bookingsOverTime: { date: string; bookings: number }[];
  revenueByMovie: { movie: string; revenue: number }[];
  topCustomers: { customer: string; totalSpent: number; bookings: number }[];
  cinemaProgress: {
    movie: string;
    bookedSeats: number;
    progress: number;
  }[];
};

// Professional color palette (kept for reference)
const COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// Chart theme configuration
const chartTheme = {
  textColor: '#E5E7EB',
  axisLineColor: '#4B5563',
  gridColor: 'rgba(75, 85, 99, 0.2)',
  backgroundColor: 'transparent'
};

// Color list for the Revenue Pie Chart
const revenueColors = ['#8B5CF6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#D97706', '#FBBF24', '#06B6D4', '#9333EA'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use useCallback for a stable function
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in as an admin.');
      }

      const res = await fetch('https://abdullah-test.whitescastle.com/api/dash/stats', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date()); // Set the update time on success
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and automatic refresh interval (5 minutes = 300000ms)
  useEffect(() => {
    fetchStats();

    // Set up auto-refresh
    const interval = setInterval(fetchStats, 300000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRetry = () => fetchStats();

  // --- LOADING STATE ---
  // if (loading && !stats) return (
  //   <HomeWrapper>
  //     <div className="flex items-center justify-center h-[calc(100vh-79px)] bg-gradient-to-br from-gray-900 to-gray-800">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
  //         <p className="text-gray-300 text-xl font-light">Loading Dashboard...</p>
  //       </div>
  //     </div>
  //   </HomeWrapper>
  // );

  // --- ERROR STATE ---
  if (error || !stats) return (
    <HomeWrapper>
      <div className="flex items-center justify-center h-[calc(100vh-79px)] bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-xl mb-4 font-medium">{error || 'Failed to load statistics.'}</p>
          <button onClick={handleRetry} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
            Try Again
          </button>
        </div>
      </div>
    </HomeWrapper>
  );

  // Destructure after the checks ensure stats is not null
  const { bookingsOverTime, revenueByMovie, topCustomers, cinemaProgress } = stats;

  // --------------------------------------------------
  // ECHARTS OPTIONS (Refined for consistency and detail)
  // --------------------------------------------------

  // 1. CINEMA PROGRESS (Bar/Line Combo)
  const cinemaProgressOption = {
    backgroundColor: chartTheme.backgroundColor,
    title: { text: 'Cinema Seat Occupancy', left: 'center', textStyle: { color: chartTheme.textColor, fontSize: 18, fontWeight: 600 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: COLORS.primary,
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: (params: any[]) => {
        const barParam = params.find(p => p.seriesType === 'bar');
        const lineParam = params.find(p => p.seriesType === 'line');
        return `<div>
          <strong>${barParam?.axisValue}</strong><br/>
          <span style="color:#FF6B6B;">● Occupied: ${barParam?.value.toLocaleString()}</span><br/>
          <span style="color:#00C49F;">● Fill Rate: ${lineParam?.value}%</span>
        </div>`;
      }
    },
    xAxis: { type: 'category', data: cinemaProgress.map(c => c.movie.length > 15 ? c.movie.slice(0, 15) + '...' : c.movie), axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { rotate: 30, color: chartTheme.textColor } },
    yAxis: [
      { type: 'value', name: 'Seats', nameTextStyle: { color: chartTheme.textColor }, axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { color: chartTheme.textColor }, splitLine: { lineStyle: { color: chartTheme.gridColor, type: 'dashed' } } },
      { type: 'value', name: 'Fill %', nameTextStyle: { color: '#00C49F' }, min: 0, max: 100, axisLine: { lineStyle: { color: '#00C49F' } }, axisLabel: { formatter: '{value}%', color: '#00C49F' }, splitLine: { show: false } },
    ],
    grid: { left: '12%', right: '8%', bottom: '20%', top: '20%' },
    series: [
      {
        name: 'Occupied Seats',
        type: 'bar',
        data: cinemaProgress.map(c => c.bookedSeats),
        barWidth: '35%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FF6B6B' }, { offset: 1, color: '#FF8E8E' }] },
          shadowBlur: 10, shadowColor: 'rgba(255,107,107,0.3)'
        }
      },
      {
        name: 'Fill Rate',
        type: 'line',
        data: cinemaProgress.map(c => c.progress),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#00C49F', width: 4, shadowBlur: 12, shadowColor: 'rgba(0,196,159,0.3)' },
        itemStyle: { color: '#00C49F', borderColor: '#fff', borderWidth: 2 },
        areaStyle: { color: 'rgba(0,196,159,0.1)' },
        yAxisIndex: 1
      }
    ]
  };

  // 2. BOOKINGS OVER TIME (Area Line Chart)
  const bookingsOption = {
    backgroundColor: chartTheme.backgroundColor,
    title: { text: 'Booking Trends Over Time', left: 'center', textStyle: { color: chartTheme.textColor, fontSize: 18, fontWeight: 600 } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: COLORS.primary, borderWidth: 1, textStyle: { color: '#fff' } },
    xAxis: { type: 'category', data: bookingsOverTime.map(b => b.date), axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { rotate: 35, color: chartTheme.textColor }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { color: chartTheme.textColor }, splitLine: { lineStyle: { color: chartTheme.gridColor, type: 'dashed' } } },
    grid: { left: '8%', right: '5%', bottom: '15%', top: '20%' },
    series: [
      {
        name: 'Bookings',
        type: 'line',
        smooth: true,
        data: bookingsOverTime.map(b => b.bookings),
        lineStyle: { width: 4, color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#6366F1' }] } },
        areaStyle: { color: 'rgba(139,92,246,0.2)' },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#8B5CF6', borderColor: '#fff', borderWidth: 2 }
      }
    ]
  };

  // 3. REVENUE BY MOVIE (Donut Chart)
  const revenueOption = {
    title: { text: 'Revenue By Movie', left: 'center', textStyle: { color: chartTheme.textColor, fontSize: 18, fontWeight: 600 } },
    tooltip: { trigger: 'item', formatter: 'Rs {c}' },
    legend: { bottom: 0, left: 'center', textStyle: { color: chartTheme.textColor }, type: 'scroll', padding: 10 },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderColor: '#1f2937', borderWidth: 4 },
      label: {
        show: true,
        color: chartTheme.textColor,
        formatter: ({ name, value }: any) => `{b|${name}}\n{c|Rs ${value.toLocaleString()}}`,
        rich: { // Rich text allows for better styling within the label
          b: { fontSize: 14, lineHeight: 20, color: chartTheme.textColor, fontWeight: 'bold' },
          c: { fontSize: 12, lineHeight: 15, color: COLORS.accent }
        },
        overflow: 'breakAll'
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      data: revenueByMovie
        .sort((a, b) => b.revenue - a.revenue)
        .map((r, index) => ({
          value: r.revenue,
          name: r.movie.length > 20 ? r.movie.slice(0, 20) + '...' : r.movie,
          itemStyle: { color: revenueColors[index % revenueColors.length] }
        }))
    }]
  };

  // 4. TOP CUSTOMERS (Bar Chart)
  const topCustomerOption = {
    backgroundColor: chartTheme.backgroundColor,
    title: { text: 'Top Customers by Spending', left: 'center', textStyle: { color: chartTheme.textColor, fontSize: 18, fontWeight: 600 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: COLORS.primary,
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: (params: any[]) => {
        const param = params[0];
        const customer = topCustomers.find(c => (c.customer.length > 10 ? c.customer.slice(0, 10) + '...' : c.customer) === param.axisValue);
        return `<div>
          <strong>${param.axisValue}</strong><br/>
          <span style="color:#10B981;">● Total Spent: Rs ${param.value?.toLocaleString()}</span><br/>
          <span style="color:#3B82F6;">● Bookings: ${customer?.bookings || 0}</span>
        </div>`;
      }
    },
    xAxis: { type: 'category', data: topCustomers.map(c => c.customer.length > 10 ? c.customer.slice(0, 10) + '...' : c.customer), axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { color: chartTheme.textColor, rotate: 30 }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: chartTheme.axisLineColor } }, axisLabel: { color: chartTheme.textColor, formatter: 'Rs {value}' }, splitLine: { lineStyle: { color: chartTheme.gridColor, type: 'dashed' } } },
    grid: { left: '12%', right: '5%', bottom: '15%', top: '20%' },
    series: [{
      name: 'Total Spent',
      type: 'bar',
      data: topCustomers.map(c => c.totalSpent),
      barWidth: '45%',
      itemStyle: { borderRadius: [6, 6, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: COLORS.secondary }, { offset: 1, color: '#059669' }] }, shadowColor: 'rgba(16,185,129,0.3)', shadowBlur: 8 },
      emphasis: { itemStyle: { shadowColor: 'rgba(16,185,129,0.5)', shadowBlur: 12 } }
    }]
  };

  // --------------------------------------------------
  // STATS CARDS DATA
  // --------------------------------------------------
  const statsCards = [
  {
    title: 'Total Bookings',
    value: stats.totalBookings.toLocaleString(),
    canceled: `(${stats.cancelledBookings.toLocaleString()}) Canceled`,
    color: 'from-green-500 to-emerald-500',
    icon: '🎟️',
    trend: '+12%',
    trendColor: 'text-green-400 bg-green-500/20',
  },
  {
    title: 'Bookings Today',
    value: stats.totalBookingsToday.toLocaleString(),
    color: 'from-blue-500 to-cyan-500',
    icon: '📅',
    trend: '+5%',
    trendColor: 'text-cyan-400 bg-cyan-500/20',
  },
  {
    title: 'Total Revenue',
    value: `Rs ${stats.totalRevenue.toLocaleString()}`,
    canceled: `(Rs ${stats.cancelledRevenue.toLocaleString()}) Canceled Revenue`,
    color: 'from-purple-500 to-indigo-500',
    icon: '💰',
    trend: '+18%',
    trendColor: 'text-indigo-400 bg-indigo-500/20',
  },
  {
    title: 'Active Movies',
    value: stats.activeMovies.toString(),
    color: 'from-orange-500 to-amber-500',
    icon: '🎬',
    trend: '+2',
    trendColor: 'text-amber-400 bg-amber-500/20',
  },
];


  // --------------------------------------------------
  // RENDER WITH BACKGROUND IMAGE FIX
  // --------------------------------------------------
  return (
    <HomeWrapper>
      <div
        className="w-full min-h-[calc(100vh-77px)] flex relative text-gray-100"
        style={{ backgroundImage: "url('/images/dashboard.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gray-900/40 z-0"></div>
        <div className="flex w-full relative z-10 overflow-auto">
          <Sidebar />
          <main className="flex-1 px-6 overflow-y-auto max-h-[calc(100vh-77px)] scrollbar-y">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Cinema Analytics Dashboard</h1>
                <p className="text-gray-400 font-light">Real-time insights and performance metrics at a glance.</p>
              </div>

         {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {statsCards.map((card, index) => (
    <div
      key={index}
      className="group relative bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02]"
    >
      {/* Hover Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-lg`}
      />

      {/* Card Content */}
      <div className="relative z-10">
        {/* Icon + Trend */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{card.icon}</span>
          <span
            className={`text-xs ${card.trendColor} px-3 py-1 rounded-full font-medium`}
          >
            {card.trend}
          </span>
        </div>

        {/* Title */}
        <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>

        {/* Main Value */}
        <p className="text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent from-white to-gray-300 tracking-tight">
          {card.value}
        </p>

        {/* Optional canceled value */}
        {card.canceled && (
          <p className="text-sm text-red-400 mt-1">{card.canceled}</p>
        )}
      </div>
    </div>
  ))}
</div>


              {/* Charts Grid (Polished) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                  <ReactECharts option={bookingsOption} style={{ height: '400px' }} opts={{ renderer: 'svg' }} />
                </div>
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                  <ReactECharts option={revenueOption} style={{ height: '400px' }} opts={{ renderer: 'svg' }} />
                </div>
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                  <ReactECharts option={topCustomerOption} style={{ height: '400px' }} opts={{ renderer: 'svg' }} />
                </div>
                <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-2xl">
                  <ReactECharts option={cinemaProgressOption} style={{ height: '400px' }} opts={{ renderer: 'svg' }} />
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-3 mb-5 pt-8 border-t border-gray-700/50">
                <p className="text-gray-400 text-lg font-light">
                 🌐 Last updated: <strong>{lastUpdated?.toLocaleTimeString()}</strong> on {lastUpdated?.toLocaleDateString()} • Auto-refresh every minute
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </HomeWrapper>
  );
}