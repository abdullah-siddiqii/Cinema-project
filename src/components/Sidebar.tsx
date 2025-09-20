'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Film, Play, Ticket, BarChart2, Menu, X, UserPlus } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname(); // Current route

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Base menu items
  const baseMenu = [
    { name: 'Start Booking', icon: Film, path: '/start-booking' },
    { name: 'Movies', icon: Play, path: '/movies' },
    { name: 'Screens', icon: Ticket, path: '/Screens' },
  ];

  // Full menu depending on role
  const menuItems =
    user?.role === 'admin'
      ? [
          ...baseMenu,
          { name: 'Users', icon: UserPlus, path: '/users' },
          { name: 'Report', icon: BarChart2, path: '/report' },
        ]
      : baseMenu;

  const sidebarVisible = isDesktop || isOpen;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-black text-white flex items-center justify-between p-4 shadow">
        <h1 className="text-lg font-bold">Cinema Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarVisible ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static top-0 left-0 h-[calc(100vh-77px)] w-64 bg-neutral-900 text-white p-4 shadow-lg flex flex-col z-50"
      >
        {/* Title */}
        <h1 className="hidden md:block text-xl font-bold mb-6">Cinema Admin</h1>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-4">
            {menuItems.map((item) => {
              // Highlight parent menu for nested routes
              const isActive = pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => {
                    if (!isDesktop) setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0
                    ${isActive
                      ? 'bg-blue-600 shadow-lg text-white'
                      : 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-400 text-sm border-t border-gray-700 pt-4">
          <img
            src="/images/logo.jpg"
            alt="Logo"
            className="mx-auto mb-2 w-[45px] h-[45px] border-2 border-gray-700 rounded-full"
          />
          Made by <br />
          <span className="font-semibold text-white">Abdullah Siddiqui</span>
        </div>
      </motion.aside>
    </>
  );
}
