import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col selection:bg-neutral-800 selection:text-neutral-100">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-12 py-8 pb-32 flex flex-col gap-12">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
