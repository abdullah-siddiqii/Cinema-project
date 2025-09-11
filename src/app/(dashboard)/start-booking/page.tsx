// app/add-movies/page.tsx
'use client';
import Sidebar from '@/components/Sidebar';
import MoviesList from '@/components/MoviesList';
import { ToastContainer } from 'react-toastify';
import AuthGuard from '@/components/AuthGuard';
import HomeWrapper from '@/components/HomeWrapper';
import StartBooking from '@/components/Startbooking';

export default function AddMoviesPage() {
  return (
    <AuthGuard>
      <HomeWrapper>
      <div className="flex h-[calc(100vh-79px)] overflow-hidden ">
        <ToastContainer
  position="top-center"
  autoClose={1000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
/>
  <Sidebar  />
<main className="flex-1 bg-gray-100 h-[calc(100vh-79px)] overflow-y-auto scrollbar-y">
  <StartBooking />
</main>
</div>
</HomeWrapper>
</AuthGuard>
  );
}
