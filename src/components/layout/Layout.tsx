import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col selection:bg-neutral-800 selection:text-neutral-100">
      <Header />
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-36 sm:pb-44 flex flex-col gap-8 sm:gap-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
