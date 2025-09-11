// app/add-movies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify';
import AuthGuard from '@/components/AuthGuard';
import Room from '@/components/Room';

export default function AddMoviesPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) {
    // optional: show loader until user is fetched
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-77px)] overflow-hidden">
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
        <Sidebar />
        <main className="flex-1 bg-gray-100 h-[calc(100vh-77px)] ">
          {/* Pass the actual user object to Room component */}
          <Room user={user} />
        </main>
      </div>
    </AuthGuard>
  );
}
