import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [employer, setEmployer] = useState('');
  const [annualSalary, setAnnualSalary] = useState('95000');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          fullName,
          employer: employer || 'Finwell Technologies',
          annualSalary: parseFloat(annualSalary) || 95000,
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (demoEmail: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await demoLogin(demoEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isRegister ? 'Create Employee Account' : 'Finwell Employee Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* 1-Click Demo Accounts Quick Picker */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Quick Review · 1-Click Preloaded Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('alex.chen@finwell.corp')}
              disabled={submitting}
              className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-left text-xs transition-colors shadow-2xs group"
            >
              <p className="font-bold text-slate-900 group-hover:text-emerald-700">Alex Chen</p>
              <p className="text-[10px] text-slate-500">$132k · Senior SWE</p>
              <p className="text-[10px] text-emerald-600 font-medium">Full Match Capture</p>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('sarah.miller@finwell.corp')}
              disabled={submitting}
              className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-left text-xs transition-colors shadow-2xs group"
            >
              <p className="font-bold text-slate-900 group-hover:text-emerald-700">Sarah Miller</p>
              <p className="text-[10px] text-slate-500">$108k · Designer</p>
              <p className="text-[10px] text-amber-600 font-medium">Missed 401k Match</p>
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">Or with credentials</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employer Corporate Partner</label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  placeholder="e.g. Stripe, Airbnb, Google"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Salary ($)</label>
                <input
                  type="number"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  placeholder="95000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.corp"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-2"
          >
            <span>{submitting ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
          >
            {isRegister ? 'Already have an account? Sign in' : "New employee? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};
