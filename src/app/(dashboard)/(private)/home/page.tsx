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
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <AuthGuard>
      <HomeWrapper>
        <div className="relative w-full h-[calc(100vh-79px)] overflow-hidden bg-gray-900">
          {/* Toast Notification */}
          <ToastContainer position="top-center" autoClose={1000} theme="dark" />

          {/* Background */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20 animate-background-pulse"
            style={{ backgroundImage: "url('/images/home.jpg')" }}
          />

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-tr from-gray-950 via-gray-900 to-transparent opacity-70"></div>

          {/* Floating Dark Circles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gray-700/20 blur-xl animate-float"
                style={{
                  width: `${100 + i * 20}px`,
                  height: `${100 + i * 20}px`,
                  top: `${10 + i * 10}%`,
                  left: `${5 + i * 15}%`,
                  animationDelay: `${i * 1.5}s`,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <main className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center px-6 lg:px-0">
            <div className="max-w-4xl">
              {/* Heading */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-100 drop-shadow-lg animate-fade-in-up">
                Siddiqui Cineplex
              </h1>
              <p className="mt-4 text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Experience <span className="font-semibold">Cinema</span> Reimagined. <br />
                Manage with <span className="font-semibold">Precision</span> and <span className="font-semibold">Efficiency</span>.
              </p>

              {/* Bitmoji & Button */}
              <div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-12 animate-fade-in-up delay-500">
                {/* Floating Bitmoji */}
                <div className="relative flex-shrink-0 animate-float">
                  <img
                    src="/images/bitemogi.png"
                    alt="Welcome Emoji"
                    className="w-44 h-auto object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
                  />
                </div>
      
                <Link
                  href="/admin-dashboard"
                  className="relative inline-flex items-center justify-center px-12 py-5 font-bold text-white rounded-full shadow-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-6 h-6 mr-3 text-gray-300 animate-pulse" />
                  <span className="relative z-10 text-xl">Continue to Dashboard</span>
                </Link>
              </div>
            </div>
          </main>

          {/* Animations */}
          <style jsx>{`
            @keyframes animate-fade-in-up {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: animate-fade-in-up 1s ease forwards; }
            .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
            .animate-fade-in-up.delay-500 { animation-delay: 0.5s; }

            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }

            @keyframes animate-background-pulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.3; }
            }
            .animate-background-pulse { animation: animate-background-pulse 4s ease-in-out infinite; }
          `}</style>
        </div>
      </HomeWrapper>
    </AuthGuard>
  );
}
