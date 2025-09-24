'use client';

import HomeWrapper from '@/components/HomeWrapper';
import Sidebar from '@/components/Sidebar';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

type StatsData = {
  totalBookings: number;
  totalBookingsToday: number;
  totalRevenue: number;
  activeMovies: number;
  bookingsOverTime: { date: string; bookings: number }[];
  revenueByMovie: { movie: string; revenue: number }[];
  topCustomers: { customer: string; totalSpent: number; bookings: number }[];
  latestBookings: { customer: string; movie: string; seats: number; date: string }[];
};

const COLORS = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC949'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found, please login as admin');

        const res = await fetch('https://abdullah-test.whitescastle.com/api/dash/stats', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to fetch stats:', err);
        setError(err.message || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-79px)] bg-gray-900">
        <HomeWrapper children={undefined} />
      </div>
    );

  if (error || !stats)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <p className="p-6 text-xl text-red-500">{error || 'Failed to load stats.'}</p>
      </div>
    );

  const { bookingsOverTime, revenueByMovie, topCustomers, latestBookings } = stats;

  // ---------------- ECharts Options ----------------

  const bookingsOption = {
    title: {
      text: 'Bookings Over Time',
      left: 'center',
      textStyle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: bookingsOverTime.map(b => b.date),
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { rotate: 45, color: '#ccc' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#ccc' },
    },
    grid: { left: '5%', right: '5%', bottom: '15%', top: '20%' },
    series: [
      {
        data: bookingsOverTime.map(b => b.bookings),
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#00C49F' },
              { offset: 1, color: '#0088FE' },
            ],
          },
        },
        itemStyle: { color: '#00C49F' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,196,159,0.5)' },
              { offset: 1, color: 'rgba(0,136,254,0.1)' },
            ],
          },
        },
      },
    ],
  };

  const revenueOption = {
    title: {
      text: 'Revenue By Movie',
      left: 'center',
      textStyle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'item', formatter: '{b}: Rs {c}' },
    legend: { bottom: 0, textStyle: { color: '#ccc' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        avoidLabelOverlap: false,
        label: { show: true, color: '#fff', formatter: '{b}\nRs {c}' },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.5)',
          },
        },
        data: revenueByMovie.map((r, i) => ({ value: r.revenue, name: r.movie })),
        color: COLORS,
      },
    ],
  };

  const topCustomerOption = {
    title: {
      text: 'Top Customers',
      left: 'center',
      textStyle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: topCustomers.map(c => c.customer),
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#ccc', rotate: 30 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#ccc' },
    },
    grid: { left: '5%', right: '5%', bottom: '15%', top: '20%' },
    series: [
      {
        data: topCustomers.map(c => c.totalSpent),
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#8884d8' },
              { offset: 1, color: '#4E79A7' },
            ],
          },
        },
        barWidth: '50%',
      },
    ],
  };

  return (
    <HomeWrapper>
      <div
        className="flex bg-gray-950 text-gray-100 h-[calc(100vh-79px)] relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/dashboard.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gray-900/50 z-0"></div>

        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto scrollbar-y relative z-10">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-wide drop-shadow-lg">
            Admin Dashboard 📊
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="group p-6 bg-gray-800 rounded-xl shadow-xl hover:scale-[1.03] transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-300">Total Bookings</h2>
              <p className="text-4xl font-bold mt-2 text-green-400">{stats.totalBookings}</p>
            </div>

            <div className="group p-6 bg-gray-800 rounded-xl shadow-xl hover:scale-[1.03] transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-300">Bookings Today</h2>
              <p className="text-4xl font-bold mt-2 text-yellow-400">{stats.totalBookingsToday}</p>
            </div>

            <div className="group p-6 bg-gray-900 rounded-xl shadow-xl hover:scale-[1.03] transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-300">Total Revenue</h2>
              <p className="text-4xl font-bold mt-2 text-purple-400">
                Rs {stats.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="group p-6 bg-gray-800 rounded-xl shadow-xl hover:scale-[1.03] transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-300">Active Movies</h2>
              <p className="text-4xl font-bold mt-2 text-cyan-400">{stats.activeMovies}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <ReactECharts option={bookingsOption} style={{ height: 320 }} />
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <ReactECharts option={revenueOption} style={{ height: 320 }} />
            </div>
          </div>

          {/* Top Customers & Latest Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <ReactECharts option={topCustomerOption} style={{ height: 320 }} />
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-xl overflow-x-auto">
              <table className="min-w-full rounded-lg border border-gray-700">
                <thead className="bg-gray-700 text-gray-200">
                  <tr>
                    {['Customer', 'Movie', 'Seats', 'Date'].map((th, idx) => (
                      <th key={idx} className="px-4 py-3 text-left font-semibold">{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {latestBookings.map((b, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-800 odd:bg-gray-850 hover:bg-gray-600 transition-colors duration-200"
                    >
                      <td className="px-4 py-3">{b.customer}</td>
                      <td className="px-4 py-3">{b.movie}</td>
                      <td className="px-4 py-3">{b.seats}</td>
                      <td className="px-4 py-3">{b.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </HomeWrapper>
  );
}
