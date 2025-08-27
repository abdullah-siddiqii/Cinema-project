'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Film, Play, Ticket, BarChart2, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // mobile closed by default
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  // Detect screen size only on client
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); // set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Add Movies', icon: Film, path: '/add-movie' },
    { name: 'Running Movies', icon: Play, path: '/running-movies' },
    { name: 'Available Shows', icon: Ticket, path: '/available-shows' },
    { name: 'Report', icon: BarChart2, path: '/report' },
  ];

  const sidebarVisible = isDesktop || isOpen;

  return (
    <>
      {/* Top bar with hamburger (mobile only) */}
      <div className="md:hidden bg-black text-white flex items-center justify-between p-4 shadow ">
        <h1 className="text-lg font-bold">Cinema Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarVisible ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static top-0 left-0 h-screen bg-neutral-900 text-white p-4 shadow-lg flex flex-col z-50 w-64 "
      >
        <h1 className="hidden md:block text-xl font-bold mb-6">Cinema Admin</h1>

        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.path);
                if (!isDesktop) setIsOpen(false); // close on mobile
              }}
              className="w-full flex items-center gap-3 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
