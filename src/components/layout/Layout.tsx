import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-light selection:bg-neutral-800 selection:text-neutral-100">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-12 py-10 flex flex-col gap-12">
        <Outlet />
      </main>
      <footer className="w-full py-12 px-6 sm:px-12 text-center text-xs font-light text-neutral-500">
        <p className="tracking-wide">
          gammy savings platform built with Nimiq settlement
        </p>
      </footer>
    </div>
  );
};

