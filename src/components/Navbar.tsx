"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { toast } from "react-toastify";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Logout function
  const handleLogout = async () => {
  try {
    const res = await fetch("https://abdullah-test.whitescastle.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
          toast.success("Logout successful", {
            delay: 1000,
          });
          router.push("/login");// Redirect after toast disappears
    } else {
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout", error);
  }
};

  return (
    <header className="w-full bg-neutral-950 text-white shadow-md">
      <div className="max-w-8xl  px-5 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-wide">
          🎬Nagina Cineplex 4K-3D
        </Link>

        {/* Desktop Links */}
  

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-3 space-y-3">
          <Link href="/add-movies" className="block hover:text-yellow-400">Add Movies</Link>
          <Link href="/running-movies" className="block hover:text-yellow-400">Running Movies</Link>
          <Link href="/start-booking" className="block hover:text-yellow-400">Start Booking</Link>
          <Link href="/reports" className="block hover:text-yellow-400">Reports</Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 mt-3 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
