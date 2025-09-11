
// app/add-movies/page.tsx
'use client';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify/unstyled';
import ShowTimes from '@/components/ShowTimes';
import AuthGuard from '@/components/AuthGuard';
import Adduse from '@/components/Adduse';
import { useEffect, useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import UserList from '@/components/UserList';

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
        <AdminRoute user={user}>
      <div className="flex h-[calc(100vh-77px)] overflow-hidden">
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
  <main className="flex-1 bg-gray-900  h-[calc(100vh-77px)] ">
    <UserList/>
  </main>
</div>
</AdminRoute>
</AuthGuard>
  );
}
