import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { DashboardSummary, Transaction } from '../types/index.ts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewTransaction,
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboard();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse p-4"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Failed to load dashboard metrics</h3>
        <p className="text-sm text-slate-500 mb-4">{error || 'Server connection error'}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>{user?.employer || 'Corporate Platform'}</span>
            <span aria-hidden="true">·</span>
            <span>{user?.department}</span>
            <span aria-hidden="true">·</span>
            <span>{currentMonthName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName || 'Employee'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Here is your verified financial overview calculated from your live payroll and transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('paycheck')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Simulate Paycheck
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Monthly Inflow</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Verified Payroll
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${summary.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Based on {user?.payFrequency === 'SEMI_MONTHLY' ? 'Semi-monthly' : user?.payFrequency === 'BI_WEEKLY' ? 'Bi-weekly' : 'Monthly'} schedule
          </div>
        </div>

        {/* Metric 2: Monthly Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Monthly Outflow</span>
            <span className="text-slate-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Actual debits
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            ${summary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summary.categoryBreakdown.length} active spending categories
          </div>
        </div>

        {/* Metric 3: Net Cashflow / Savings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Net Monthly Savings</span>
            <span className={`font-semibold ${summary.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.savingsRatePct}% savings rate
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono-numbers ${summary.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ${summary.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Surplus retained after living expenses
          </div>
        </div>

        {/* Metric 4: Wellness Score Summary */}
        <div
          onClick={() => onNavigateTab('wellness')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="group-hover:text-slate-900 font-medium">Financial Wellness</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Details
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono-numbers">
              {summary.wellnessScore}
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">/ 100</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              {summary.wellnessScore >= 80 ? 'Exemplary Health' : summary.wellnessScore >= 65 ? 'Healthy Standing' : 'Needs Optimization'}
            </span>
            <span className="text-slate-400 font-medium">View diagnostics →</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Category Breakdown + Cash Flow Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Spending Breakdown by Category */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Current Month Expense Allocation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated from {summary.recentTransactions.length} tracked ledger transactions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
            >
              Manage Budgets →
            </button>
          </div>

          {summary.categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded for this billing cycle yet.
            </div>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((cat) => {
                const isOverBudget = cat.budgetLimit > 0 && cat.amount > cat.budgetLimit;
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-800">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-mono-numbers">
                        <span>${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className="text-slate-400">({cat.percentage}%)</span>
                        {cat.budgetLimit > 0 && (
                          <span className={isOverBudget ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                            / ${cat.budgetLimit.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-rose-500' : 'bg-slate-800'
                        }`}
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Budget Adherence Summary Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 gap-2">
            <div>
              <span>Total Monthly Budget Cap: </span>
              <strong className="text-slate-900 font-mono-numbers">${summary.totalBudgetLimit.toLocaleString()}</strong>
            </div>
            <div>
              <span>Remaining Discretionary Buffer: </span>
              <strong className="text-emerald-700 font-mono-numbers">${summary.remainingBudget.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: 6-Month Cash Flow Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Cash Flow History</h2>
            <span className="text-xs text-slate-500">Last 6 Months</span>
          </div>

          <div className="space-y-4">
            {summary.monthlyTrends.map((trend, idx) => {
              const maxVal = Math.max(...summary.monthlyTrends.map((t) => Math.max(t.income, t.expense, 1000)));
              const incPct = (trend.income / maxVal) * 100;
              const expPct = (trend.expense / maxVal) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{trend.month}</span>
                    <span className="text-slate-500 font-mono-numbers">
                      Net: +${trend.netSavings.toLocaleString()}
                    </span>
                  </div>
                  {/* Paired bars */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-10">In</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${incPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 w-12 text-right font-mono-numbers">
                        ${Math.round(trend.income / 1000)}k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-10">Out</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-700 rounded-full"
                          style={{ width: `${expPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 w-12 text-right font-mono-numbers">
                        ${Math.round(trend.expense / 1000)}k
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-700 rounded-full"></span> Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live records synchronized from employee corporate ledger</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
          >
            View Full Ledger ({summary.recentTransactions.length} records) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-6 font-semibold">Merchant / Source</th>
                <th className="py-3 px-6 font-semibold">Category</th>
                <th className="py-3 px-6 font-semibold">Payment Method</th>
                <th className="py-3 px-6 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.recentTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 text-slate-600 font-mono-numbers whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <p className="font-semibold text-slate-900">{tx.merchant}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{tx.description}</p>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                    {tx.paymentMethod}
                  </td>
                  <td className={`py-3.5 px-6 font-semibold font-mono-numbers text-right whitespace-nowrap ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
