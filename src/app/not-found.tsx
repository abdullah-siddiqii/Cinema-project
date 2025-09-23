'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 🔹 Background image */}
      <img
        src="/images/404.jpg"
        alt="404 Background"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
      />

      {/* 🔹 Blood-red overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-red-900/40 to-black/30" />

      {/* 🔹 Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-6">
        {/* 404 Heading with glitch */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-7xl md:text-9xl font-extrabold tracking-widest text-gray-200 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)] animate-pulse"
        >
          404
        </motion.h1>

        {/* Subtitle */}
       <motion.p
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.5, duration: 0.8 }}
  className="mt-6 text-xl md:text-3xl text-gray-400 font-light italic"
>
  Oops! The page you’re looking for doesn’t exist.
</motion.p>


        {/* Back Button */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link
            href="/home"
            className="mt-10 inline-block px-8 py-3 rounded-2xl 
            bg-gradient-to-r from-red-700 to-red-900 
            hover:from-red-600 hover:to-red-800 
            text-white font-bold shadow-[0_0_25px_rgba(255,0,0,0.8)] 
            hover:shadow-[0_0_45px_rgba(255,0,0,1)] 
            transition-transform transform hover:scale-110 duration-300"
          >
            🔥 Escape to Safety
          </Link>
        </motion.div>
      </div>

      {/* 🔹 Floating dangerous aura */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-72 h-72 bg-red-800/30 rounded-full blur-3xl animate-pulse top-10 left-10" />
        <div className="absolute w-96 h-96 bg-red-900/40 rounded-full blur-3xl animate-ping bottom-20 right-10" />
      </div>
    </div>
  );
}
