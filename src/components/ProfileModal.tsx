import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Check, ShieldCheck } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [department, setDepartment] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [payFrequency, setPayFrequency] = useState<'BI_WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY'>('SEMI_MONTHLY');
  const [employee401kPct, setEmployee401kPct] = useState('');
  const [hsaMonthly, setHsaMonthly] = useState('');
  const [healthInsMonthly, setHealthInsMonthly] = useState('');
  const [state, setState] = useState('CA');
  const [emergencyFund, setEmergencyFund] = useState('');
  const [totalDebt, setTotalDebt] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setTitle(user.title);
      setEmployer(user.employer);
      setDepartment(user.department);
      setAnnualSalary(String(user.annualSalary));
      setPayFrequency(user.payFrequency);
      setEmployee401kPct(String(user.employee401kContributionPct));
      setHsaMonthly(String(user.hsaMonthlyContribution));
      setHealthInsMonthly(String(user.healthInsuranceMonthly));
      setState(user.state);
      setEmergencyFund(String(user.emergencyFundBalance));
      setTotalDebt(String(user.totalDebt));
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSubmitting(true);
      await updateUser({
        fullName: fullName.trim(),
        title: title.trim(),
        employer: employer.trim(),
        department: department.trim(),
        annualSalary: parseFloat(annualSalary) || 90000,
        payFrequency,
        employee401kContributionPct: parseFloat(employee401kPct) || 6.0,
        hsaMonthlyContribution: parseFloat(hsaMonthly) || 0,
        healthInsuranceMonthly: parseFloat(healthInsMonthly) || 0,
        state,
        emergencyFundBalance: parseFloat(emergencyFund) || 0,
        totalDebt: parseFloat(totalDebt) || 0,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Employee Compensation & Profile</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
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

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile and payroll parameters successfully saved!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employer</label>
              <input
                type="text"
                required
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Payroll & Deductions Setup
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Salary ($)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Frequency</label>
                <select
                  value={payFrequency}
                  onChange={(e) => setPayFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
                >
                  <option value="SEMI_MONTHLY">Semi-Monthly (24)</option>
                  <option value="BI_WEEKLY">Bi-Weekly (26)</option>
                  <option value="MONTHLY">Monthly (12)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
                >
                  <option value="CA">California (CA)</option>
                  <option value="NY">New York (NY)</option>
                  <option value="TX">Texas (TX)</option>
                  <option value="WA">Washington (WA)</option>
                  <option value="FL">Florida (FL)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">401(k) Deferral %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                required
                value={employee401kPct}
                onChange={(e) => setEmployee401kPct(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">HSA Contribution/mo ($)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={hsaMonthly}
                onChange={(e) => setHsaMonthly(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Health Premium/mo ($)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={healthInsMonthly}
                onChange={(e) => setHealthInsMonthly(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Financial Baseline Reserves
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Fund ($)</label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Non-Mortgage Debt ($)</label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={totalDebt}
                  onChange={(e) => setTotalDebt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
