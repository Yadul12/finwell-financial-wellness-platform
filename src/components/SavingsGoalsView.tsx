import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { SavingsGoal } from '../types/index.ts';
import {
  PiggyBank,
  PlusCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  DollarSign,
  X,
  Target,
  Edit2,
  Trash2,
} from 'lucide-react';

export const SavingsGoalsView: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New goal form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('EMERGENCY_FUND');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('500');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSavingsGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;

    try {
      setSubmitting(true);
      await apiClient.createSavingsGoal({
        name: name.trim(),
        category,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        targetDate,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        color: '#3b82f6',
      });
      setIsAddOpen(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      setSubmitting(true);
      await apiClient.contributeToGoal(contributeGoal.id, amount);
      setContributeGoal(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to record contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await apiClient.deleteSavingsGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal.');
    }
  };

  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const totalMonthlyAuto = goals.reduce((s, g) => s + Number(g.monthlyContribution), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Capital Accumulation & Goal Tracking</span>
            <span aria-hidden="true">·</span>
            <span>{goals.length} Goals Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Set target milestones, automate recurring salary allocations, and track funding progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Total Accumulated Capital</p>
          <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all personal funding pools</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Overall Portfolio Target</p>
          <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">{overallPct}% aggregate funded</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Monthly Auto-Allocation Pace</p>
          <p className="text-2xl font-bold text-emerald-700 font-mono-numbers">
            ${totalMonthlyAuto.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
          </p>
          <p className="text-xs text-slate-500 mt-1">Swept automatically from net payroll</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
          const remainingAmount = Math.max(g.targetAmount - g.currentAmount, 0);

          return (
            <div
              key={g.id}
              className={`bg-white rounded-xl border p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all ${
                g.isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {g.category.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{g.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Balance & Target numbers */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Saved so far</span>
                    <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                      ${g.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Goal Target</span>
                    <span className="text-sm font-semibold text-slate-600 font-mono-numbers">
                      ${g.targetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        g.isCompleted ? 'bg-emerald-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 font-mono-numbers">{pct}% Funded</span>
                    <span className="text-slate-500 font-mono-numbers">
                      {g.isCompleted ? 'Target Reached!' : `$${remainingAmount.toLocaleString()} remaining`}
                    </span>
                  </div>
                </div>

                {/* Timeline metadata */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Date</span>
                    <span className="font-medium text-slate-700 font-mono-numbers">{g.targetDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Auto-Allocation</span>
                    <span className="font-medium text-slate-700 font-mono-numbers">${g.monthlyContribution}/mo</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setContributeGoal(g);
                    setDepositAmount('500');
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    g.isCompleted
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{g.isCompleted ? 'Deposit Additional Funds' : 'Deposit / Allocate Funds'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">Create Savings Goal</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Down Payment for Home, Emergency Fund"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="EMERGENCY_FUND">Emergency Fund</option>
                    <option value="HOME_PURCHASE">Home Purchase</option>
                    <option value="VACATION">Vacation & Travel</option>
                    <option value="INVESTMENT">Investment Capital</option>
                    <option value="DEBT_PAYOFF">Debt Payoff</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount ($) *</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Balance ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Auto-Save ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Contribution Modal */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Fund Goal</h3>
                <p className="text-xs text-slate-500">{contributeGoal.name}</p>
              </div>
              <button onClick={() => setContributeGoal(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="10"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold font-mono-numbers focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
