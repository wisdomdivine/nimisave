import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SavingsProvider } from './context/SavingsContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { HobbyPromptsPage } from './pages/HobbyPromptsPage';
import { WalletPage } from './pages/WalletPage';
import { CreateGoalPage } from './pages/CreateGoalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SavingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="prompts" element={<HobbyPromptsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="create" element={<CreateGoalPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SavingsProvider>
    </QueryClientProvider>
  );
};

export default App;
