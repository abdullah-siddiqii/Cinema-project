'use client';

import HomeWrapper from '@/components/HomeWrapper';
import Sidebar from '@/components/Sidebar';
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from 'recharts';

type StatsData = {
  totalBookings: number;
  totalRevenue: number;
  activeMovies: number;
  bookingsOverTime: { date: string; bookings: number }[];
  revenueByMovie: { movie: string; revenue: number }[];
  topCustomers: { customer: string; totalSpent: number; bookings: number }[];
  latestBookings: { customer: string; movie: string; seats: number; date: string }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A280FF', '#FF6384'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found, please login as admin');

        const res = await fetch(
          'https://abdullah-test.whitescastle.com/api/dash/stats',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      <div className="flex items-center justify-center h-[calc(100vh-79px)]">
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

  return (
    <HomeWrapper>
      <div className="flex bg-gray-950 text-gray-100 h-[calc(100vh-79px)]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto scrollbar-y h-[calc(100vh-79px)]">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-wide drop-shadow-lg">
            Admin Dashboard 📊
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Total Bookings */}
            <div className="group relative p-6 bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 opacity-20 blur-2xl pointer-events-none rounded-xl animate-gradient-slow"></div>
              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-gray-300">Total Bookings</h2>
                <p className="text-4xl sm:text-5xl font-bold mt-2 text-green-400">{stats.totalBookings}</p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="group relative p-6 bg-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-20 blur-3xl animate-gradient-slow pointer-events-none rounded-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-300">Total Revenue</h2>
                  <p className="text-4xl sm:text-5xl font-bold mt-2 text-purple-400">
                    Rs {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-6xl text-purple-600 opacity-40">💰</div>
              </div>
            </div>

            {/* Active Movies */}
            <div className="group relative p-6 bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-cyan-700 opacity-20 blur-2xl pointer-events-none rounded-xl animate-gradient-slow"></div>
              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-gray-300">Active Movies</h2>
                <p className="text-4xl sm:text-5xl font-bold mt-2 text-cyan-400">{stats.activeMovies}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Bookings Over Time */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Bookings Over Time 📈</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line
                    type="natural"
                    dataKey="bookings"
                    stroke="#00C49F"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#00C49F', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#fff', stroke: '#00C49F', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue By Movie */}
          {/* Revenue By Movie */}
<div className="p-6 bg-gray-800 rounded-lg shadow-xl text-gray-300">
  <h2 className="text-xl font-semibold mb-4">Revenue By Movie 💰</h2>
  <div className="flex flex-col items-center">
   <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={revenueByMovie}
      dataKey="revenue"
      nameKey="movie"
      cx="50%"
      cy="50%"
      outerRadius={80}
      label={false}
    >
      {revenueByMovie.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded shadow-lg">
              <strong>{data.movie}</strong> <br />
              Revenue: Rs {data.revenue.toLocaleString()}
            </div>
          );
        }
        return null;
      }}
    />
  </PieChart>
</ResponsiveContainer>


    {/* Movie sales list with color indicators */}
    <div className="mt-4 w-full grid grid-cols-2 gap-4 text-gray-200">
      {revenueByMovie.map((r, i) => (
        <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            ></span>
            <span>{r.movie}</span>
          </div>
          <span>Rs {r.revenue.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
</div>

          </div>

          {/* Top Customers & Latest Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Customers */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Top 5 Customers 👑</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="customer" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="natural"
                    dataKey="totalSpent"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#fff', stroke: '#8884d8', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Latest Bookings */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Latest Bookings 🎟️</h2>
              <table className="min-w-full rounded-lg border border-gray-700">
                <thead className="bg-gray-700 text-gray-200 bg-gradient-to-r from-gray-700 to-gray-800">
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
