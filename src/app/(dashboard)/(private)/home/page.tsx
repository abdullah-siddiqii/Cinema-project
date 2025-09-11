'use client';

import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { Film, Play, Ticket, BarChart2, UserPlus, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import HomeWrapper from "@/components/HomeWrapper";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Default menu items
  const baseMenu = [
    {
      name: "Start Booking",
      icon: Film,
      path: "/start-booking",
      desc: "Begin the booking process for a movie",
    },
    {
      name: "Movies",
      icon: Play,
      path: "/movies",
      desc: "See which movies are currently showing",
    },
    {
      name: "Screens",
      icon: Ticket,
      path: "/Screens",
      desc: "View available screening rooms",
    },
  ];

  // If admin, add extra options
  const menuItems =
    user?.role === "admin"
      ? [
          ...baseMenu,
         
          {
            name: "User",
            icon: UserPlus,
            path: "/users",
            desc: "Create a new cinema manager or staff account",
          },
          {
            name: "Report",
            icon: BarChart2,
            path: "/report",
            desc: "Access detailed booking reports",
          },
         
         
        ]
      : baseMenu;

  return (
    <AuthGuard>
      <HomeWrapper>
        <div className="flex w-full h-[calc(100vh-77px)] overflow-hidden">
          {/* Toast Notification */}
          <ToastContainer position="top-center" autoClose={1000} theme="dark" />

          {/* Main Content */}
          <main className="flex-1 relative overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{ backgroundImage: "url('/images/home.jpg')" }}
            />

            {/* Floating circles */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/5 animate-pulse-slow"
                  style={{
                    width: `${200 + i * 40}px`,
                    height: `${200 + i * 40}px`,
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 20}%`,
                    transform: `translate(-50%, -50%)`,
                    animationDelay: `${i * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Content (scrollable only inside) */}
            <div className="relative z-10 h-[calc(100vh-77px)] scrollbar-y">
              <div className="max-w-6xl mx-auto">
                {/* Heading */}
                <div className="text-center ml-35 mb-12 animate-fade-in">
                  <h1
                    className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight 
                    bg-gradient-to-r from-gray-900 to-gray-900
                    bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    Welcome to the Cinema
                  </h1>
                  <p className="text-xl font-bold md:text-xl text-black max-w-2xl mx-auto leading-relaxed animate-pulse-slow">
                    Manage your cinema with{" "}
                    <span className="text-gray-900 font-bold">Precision</span>{" "}
                    and{" "}
                    <span className="text-gray-900 font-bold">Efficiency</span>
                  </p>
                </div>

                {/* Content Row */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-7 lg:gap-3">
                  {/* Emoji */}
                  <div className="relative flex-shrink-0 animate-float">
                    <img
                      src="/images/bitemogi.png"
                      alt="Welcome Emoji"
                      className="relative w-56 h-96 object-contain z-10"
                    />
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {menuItems.map((item, index) => (
                      <div
                        key={index}
                        className="group relative animate-fade-in"
                        style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-300 group-hover:blur-md"></div>
                        <Link href={item.path} className="relative block">
                          <div className="relative flex flex-col justify-between h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl overflow-hidden">
                            <div className="mb-4">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm">
                                <item.icon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2">
                                {item.name}
                              </h3>
                              <p className="text-purple-100 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </HomeWrapper>
    </AuthGuard>
  );
}
