// app/movies/add/page.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify';
import AuthGuard from '@/components/AuthGuard';
import ScreenList from '@/components/ScreenList';


export default function AddMoviesPage() {
 

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
          <ScreenList/>
        </main>
      </div>
    </AuthGuard>
  );
}
