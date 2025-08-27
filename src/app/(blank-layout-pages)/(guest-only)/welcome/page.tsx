'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import HomeWrapper from '@/components/HomeWrapper'; // Adjust path if needed

export default function Welcome() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  if (loading) {
    return (
      <HomeWrapper>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        </div>
      </HomeWrapper>
    );
  }

  return (
    <HomeWrapper>
      <main
        className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundImage: "url('/images/welcome.jpg')" }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
          🎬 Welcome to{" "}
          <span className="text-yellow-400">Nagina Cineplex 4K-3D</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl">
          Step into a world of immersive entertainment like never before.
        </p>
        <button
          onClick={handleStart}
          disabled={loading}
          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-yellow-300/50 transition-transform duration-300"
        >
          Let’s Start
          <ArrowRight size={20} className="ml-2" />
        </button>
      </main>
    </HomeWrapper>
  );
}
