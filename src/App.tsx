import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { BudgetsView } from './components/BudgetsView.tsx';
import { PaycheckView } from './components/PaycheckView.tsx';
import { SavingsGoalsView } from './components/SavingsGoalsView.tsx';
import { WellnessView } from './components/WellnessView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { apiClient } from './api/client.ts';
import { ShieldCheck, Layers, Server, Lock, ExternalLink } from 'lucide-react';

function FinwellAppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);

  const handleQuickLogTransaction = async (txData: any) => {
    await apiClient.createTransaction(txData);
    // Reload or refresh view by changing state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-md animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finwell Enterprise Platform</h2>
          <p className="text-xs text-slate-400">Loading verified payroll & ledger sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Bar Navigation (3-Zone Contract) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setCurrentTab}
            onOpenNewTransaction={() => setIsNewTxOpen(true)}
          />
        )}
        {currentTab === 'transactions' && <TransactionsView />}
        {currentTab === 'budgets' && <BudgetsView />}
        {currentTab === 'paycheck' && <PaycheckView />}
        {currentTab === 'savings' && <SavingsGoalsView />}
        {currentTab === 'wellness' && <WellnessView onNavigateTab={setCurrentTab} />}
        {currentTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Enterprise Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Finwell Financial Wellness Platform</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">SDE Portfolio Implementation</span>
          </div>

          <div className="flex items-center gap-6 text-slate-500">
            <button
              onClick={() => setCurrentTab('architecture')}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Architecture & Actuator</span>
            </button>
            <a
              href="/api/docs/spec.json"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <span>OpenAPI Spec</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>v1.4.0 (Spring Boot 3 + Vite)</span>
          </div>
        </div>
      </footer>

      {/* Quick Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <TransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        onSave={handleQuickLogTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinwellAppContent />
    </AuthProvider>
  );
}
