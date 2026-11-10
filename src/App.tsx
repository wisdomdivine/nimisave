import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SavingsProvider, useSavings } from './context/SavingsContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HobbyPromptsPage } from './pages/HobbyPromptsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { WalletPage } from './pages/WalletPage';
import { CreateGoalPage } from './pages/CreateGoalPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CreateGoalModal } from './components/modals/CreateGoalModal';
import { ConnectWalletModal } from './components/modals/ConnectWalletModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const GlobalModals: React.FC = () => {
  const {
    isCreateGoalOpen,
    closeCreateGoal,
    isConnectModalOpen,
    closeConnectModal,
  } = useSavings();

  return (
    <>
      <CreateGoalModal isOpen={isCreateGoalOpen} onClose={closeCreateGoal} />
      <ConnectWalletModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />
    </>
  );
};

const ProtectedRoute: React.FC = () => {
  const { isWalletConnected, isSessionLoading, openConnectModal } = useSavings();

  useEffect(() => {
    if (!isSessionLoading && !isWalletConnected) {
      openConnectModal();
    }
  }, [isSessionLoading, isWalletConnected, openConnectModal]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 text-neutral-400 flex items-center justify-center text-xs font-light">
        Verifying session
      </div>
    );
  }

  if (!isWalletConnected) {
    return <Navigate to="/" replace />;
  }

  return <Layout />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SavingsProvider>
          <BrowserRouter>
            <GlobalModals />
            <Routes>
              {/* Standalone Minimalist Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authenticated In-App Dashboard & Tool Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="prompts" element={<HobbyPromptsPage />} />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="create" element={<CreateGoalPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SavingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
