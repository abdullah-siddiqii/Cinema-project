'use client';
import React from 'react';
import Sidebar from '@/components/Sidebar';
import HomeWrapper from '@/components/HomeWrapper';
import AuthGuard from '@/components/AuthGuard';
import Report from '@/components/Report';
import { ToastContainer } from 'react-toastify';

export default function ReportPage() {
  return (
    <AuthGuard>
      <HomeWrapper>
        <div className="flex h-[calc(100vh-79px)]">
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
          <Sidebar />
          <main className="flex-1 bg-gray-950 h-[calc(100vh-79px)]  ">
            <Report />
          </main>
        </div>
      </HomeWrapper>
    </AuthGuard>
  );
}
