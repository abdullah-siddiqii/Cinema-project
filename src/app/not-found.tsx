'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 🔹 Background image */}
      <img
        src="/images/404.jpg"
        alt="404 Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* 🔹 Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 🔹 Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-6">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-8xl font-bold drop-shadow-[gray-900]"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 text-lg md:text-2xl text-gray-200"
        >
          Oops! The page you’re looking for doesn’t exist.
        </motion.p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/"
            className="mt-8 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold shadow-lg hover:shadow-2xl transition"
          >
            🚀 Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
