import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { Budget, TransactionCategory } from '../types/index.ts';
import {
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  PieChart,
} from 'lucide-react';

const CATEGORIES: TransactionCategory[] = [
  'Housing & Rent',
  'Groceries',
  'Dining & Coffee',
  'Utilities & Bills',
  'Transportation',
  'Healthcare & Wellness',
  'Entertainment & Leisure',
  'Shopping & Goods',
  'Education & Learning',
  'Financial & Savings',
  'Other',
];

export const BudgetsView: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Editing states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<TransactionCategory>('Groceries');
  const [newLimit, setNewLimit] = useState('');
  const [newThreshold, setNewThreshold] = useState('80');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getBudgets();
      setBudgets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    try {
      setSubmitting(true);
      await apiClient.createBudget({
        category: newCategory,
        monthlyLimit: limitNum,
        alertThresholdPct: parseInt(newThreshold, 10) || 80,
      });
      setIsAddOpen(false);
      setNewLimit('');
      fetchBudgets();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const limitNum = parseFloat(editLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    try {
      await apiClient.updateBudget(id, { monthlyLimit: limitNum });
      setEditingId(null);
      fetchBudgets();
    } catch (err: any) {
      setError(err.message || 'Failed to update budget limit.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await apiClient.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget.');
    }
  };

  // Metrics
  const totalAllocated = budgets.reduce((s, b) => s + Number(b.monthlyLimit), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);
  const remaining = Math.max(totalAllocated - totalSpent, 0);
  const overBudgetBudgets = budgets.filter((b) => b.spent > b.monthlyLimit);

  const currentPeriod = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Filter out categories that already have a budget
  const availableCategories = CATEGORIES.filter((c) => !budgets.some((b) => b.category === c));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Monthly Target Allocation</span>
            <span aria-hidden="true">·</span>
            <span>{currentPeriod}</span>
            <span aria-hidden="true">·</span>
            <span>{budgets.length} Categories Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Budget Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enforce spending discipline by category. Real-time consumption is dynamically calculated from your transaction ledger.
          </p>
        </div>

        <button
          onClick={() => {
            if (availableCategories.length > 0) {
              setNewCategory(availableCategories[0]);
            }
            setIsAddOpen(true);
          }}
          disabled={availableCategories.length === 0}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Add Category Budget</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Total Monthly Budget</p>
          <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across {budgets.length} monitored categories</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Total Spent to Date</p>
          <p className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}% consumed` : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Remaining Discretionary Buffer</p>
          <p className="text-2xl font-bold text-emerald-700 font-mono-numbers">
            ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Unspent allowance this billing cycle</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs text-slate-500 mb-1">Budget Adherence Health</p>
          <p className={`text-2xl font-bold font-mono-numbers ${overBudgetBudgets.length === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {overBudgetBudgets.length === 0 ? '100% Compliant' : `${overBudgetBudgets.length} Over Budget`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {overBudgetBudgets.length === 0 ? 'All categories in control' : 'Requires spending reduction'}
          </p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.monthlyLimit) * 100);
          const isOver = b.spent > b.monthlyLimit;
          const isWarning = !isOver && pct >= (b.alertThresholdPct || 80);

          return (
            <div
              key={b.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
                isOver ? 'border-rose-300' : isWarning ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{b.category}</h3>
                    <p className="text-xs text-slate-500">
                      Alert at {b.alertThresholdPct || 80}% limit
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(b.id);
                        setEditLimit(String(b.monthlyLimit));
                      }}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount details */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Spent</span>
                    <span className="text-lg font-bold text-slate-900 font-mono-numbers">
                      ${b.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Limit</span>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-xs font-mono-numbers"
                        />
                        <button
                          onClick={() => handleSaveEdit(b.id)}
                          className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-700 font-mono-numbers">
                        ${b.monthlyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-slate-900'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono-numbers">{pct}% utilized</span>
                    <span
                      className={`font-semibold ${
                        isOver
                          ? 'text-rose-600'
                          : isWarning
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isOver
                        ? `Over by $${(b.spent - b.monthlyLimit).toFixed(2)}`
                        : `$${(b.monthlyLimit - b.spent).toFixed(2)} remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill-less footer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Monthly cap reset on the 1st</span>
                {isOver ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Action required
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Within limit
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Budget Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-semibold text-slate-900">Add Category Budget</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TransactionCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Limit ($ USD)
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  required
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alert Warning Threshold (%)
                </label>
                <select
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="70">70% of limit</option>
                  <option value="80">80% of limit (Recommended)</option>
                  <option value="90">90% of limit</option>
                </select>
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
                  {submitting ? 'Creating...' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
