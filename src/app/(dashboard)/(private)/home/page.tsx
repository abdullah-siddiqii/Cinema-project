'use client';

import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import HomeWrapper from '@/components/HomeWrapper';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthGuard>
      <HomeWrapper>
        <div className="flex w-full h-[calc(100vh-79px)] overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-950">
          {/* Toast Notification */}
          <ToastContainer position="top-center" autoClose={1000} theme="dark" />

          {/* Background Overlay & Effects */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 animate-background-pulse" // Added background pulse
            style={{ backgroundImage: "url('/images/home.jpg')" }} // Changed back to home.jpg as per original
          />
          {/* Gradients with subtle shift animations */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-70 animate-gradient-shift-t"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-950 via-transparent to-transparent opacity-40 animate-gradient-shift-r"></div>

          {/* Floating circles - Enhanced */}
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/5 blur-xl animate-float-gentle"
                style={{
                  width: `${150 + i * 30}px`,
                  height: `${150 + i * 30}px`,
                  top: `${15 + i * 10}%`,
                  left: `${10 + i * 15}%`,
                  transform: `translate(-50%, -50%)`,
                  animationDelay: `${i * 2.5}s`,
                  opacity: `${0.1 + i * 0.05}`,
                }}
              />
            ))}
          </div>

          {/* Main Content: Flexbox for centering */}
          <main className="relative z-10 flex flex-col items-center justify-center w-full p-8 text-center">
            <div className="max-w-4xl">
              {/* Heading */}
              <div className="mb-8 animate-fade-in-up">
                <h1
                  className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight 
                  bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400
                  drop-shadow-[0_0_30px_rgba(150,0,255,0.4)]"
                >
                  Siddiqui Cineplex
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-pulse-light">
                  Experience{' '}
                  <span className="text-purple-400 font-bold">Cinema</span>{' '}
                  Reimagined: <br /> Manage with{' '}
                  <span className="text-purple-400 font-bold">Precision</span>{' '}
                  and{' '}
                  <span className="text-purple-400 font-bold">Efficiency</span>
                </p>
              </div>

              {/* Bitmoji and Button */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full">
                {/* Bitmoji - Enhanced */}
                <div className="relative flex-shrink-0 animate-float-bounce"> {/* Changed float-subtle to float-bounce */}
                  <img
                    src="/images/bitemogi.png"
                    alt="Welcome Emoji"
                    className="relative w-44 h-auto object-contain z-10 drop-shadow-[0_0_25px_rgba(160,0,255,0.5)] transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Single Action Button */}
                <Link
                  href="/this-project-admin-dashboard"
                  className="group relative inline-flex items-center justify-center px-10 py-5 font-bold 
                             text-white rounded-full shadow-lg 
                             bg-gradient-to-br from-purple-700 to-indigo-900 
                             hover:from-purple-800 hover:to-indigo-900 
                             transition-all duration-300 ease-in-out 
                             transform hover:scale-105 hover:shadow-xl 
                             active:scale-95 animate-fade-in-scale"
                >
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-500 to-indigo-700 blur-sm transition-opacity duration-300"></div>
                  <Sparkles className="w-6 h-6 mr-3 text-purple-200 group-hover:text-white transition-colors duration-300" />
                  <span className="relative z-10 text-xl">Continue to Dashboard</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </HomeWrapper>
    </AuthGuard>
  );
}