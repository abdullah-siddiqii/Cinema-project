
// app/movies/add/page.tsx
'use client';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify/unstyled';
import ShowTimes from '@/components/ShowTimes';
import AuthGuard from '@/components/AuthGuard';
import AdminRoute from '@/components/AdminRoute';
import { useEffect, use, useState } from 'react';
import HomeWrapper from '@/components/HomeWrapper';
import AddMovies from '@/components/AddMovies';


export default function ShowTimesPage() {
     const [user, setUser] = useState<any>(null);
    
      useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }, []);
  return (
    <AuthGuard>
        <HomeWrapper>
      <AdminRoute user={user}>
        <div className="flex h-[calc(100vh-77px)] ">
          <ToastContainer
            position="top-center"
            autoClose={1500}
            hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
/>
  <Sidebar />
  <main className="flex-1 bg-gray-100  h-[calc(100vh-79px)]   ">
    <AddMovies />
  </main>
</div>
</AdminRoute>
</HomeWrapper>
</AuthGuard>
  );
}
