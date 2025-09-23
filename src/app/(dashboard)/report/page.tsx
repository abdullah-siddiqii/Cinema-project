'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative h-[calc(100vh-77px)]  w-screen overflow-hidden">
      {/* 🔹 Background image */}
      <img
        src="/images/404.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 animate-pulse"
      />

      {/* 🔹 Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

      {/* 🔹 Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-6">
        {/* Title */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-8xl font-extrabold tracking-widest bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl"
        >
          Report
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 text-xl md:text-3xl text-gray-200 italic"
        >
          🚧 Coming Soon... Stay Tuned!
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link
            href="/home"
            className="mt-10 inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 
            hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500 
            text-white font-semibold shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105 duration-300"
          >
            🚀 Back to Home
          </Link>
        </motion.div>
      </div>

      {/* 🔹 Floating lights effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse top-20 left-10" />
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-ping bottom-20 right-10" />
      </div>
    </div>
  );
}
