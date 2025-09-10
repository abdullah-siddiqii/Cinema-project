// app/add-movies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AddMovies from '@/components/AddMovies';
import { ToastContainer } from 'react-toastify';
import AuthGuard from '@/components/AuthGuard';
import AdminRoute from '@/components/AdminRoute';

export default function AddMoviesPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <AuthGuard>
      <AdminRoute user={user}>
        <div className="flex h-[calc(100vh-77px)]">
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
          <main className="flex-1 bg-gray-100 h-[calc(100vh-77px)]">
            <AddMovies />
          </main>
        </div>
      </AdminRoute>
    </AuthGuard>
  );
}
