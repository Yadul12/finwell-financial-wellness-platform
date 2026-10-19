import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, UserCircle, LogOut, ArrowRightLeft, Settings, Check } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenProfile,
  onOpenAuth,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'paycheck', label: 'Paycheck & 401(k)' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'wellness', label: 'Wellness Advisor' },
    { id: 'architecture', label: 'Architecture & API' },
  ];

  const handleSwitchAccount = async (email: string) => {
    await demoLogin(email);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Finwell
            </span>
          </div>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Account & Action */}
          <div className="flex items-center gap-3 shrink-0 relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors text-xs text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <p className="font-semibold text-slate-800">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{user.title}</p>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 text-sm z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">{user.employer}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Compensation & Profile</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <p className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Demo Employee
                      </p>
                      <button
                        onClick={() => handleSwitchAccount('alex.chen@finwell.corp')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700"
                      >
                        <div>
                          <p className="font-medium">Alex Chen ($132k)</p>
                          <p className="text-[10px] text-slate-400">Senior SWE · High Wellness</p>
                        </div>
                        {user.email === 'alex.chen@finwell.corp' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleSwitchAccount('sarah.miller@finwell.corp')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700"
                      >
                        <div>
                          <p className="font-medium">Sarah Miller ($108k)</p>
                          <p className="text-[10px] text-slate-400">Designer · 401k Opportunity</p>
                        </div>
                        {user.email === 'sarah.miller@finwell.corp' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 text-xs font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
