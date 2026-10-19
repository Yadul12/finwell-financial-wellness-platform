import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { Transaction, TransactionType, TransactionCategory } from '../types/index.ts';
import { TransactionModal } from './TransactionModal.tsx';
import {
  Search,
  Download,
  PlusCircle,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTransactions({
        type: typeFilter,
        category: categoryFilter,
        search: searchQuery,
        startDate,
        endDate,
      });
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, searchQuery, startDate, endDate, user]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    if (editingTransaction) {
      const updated = await apiClient.updateTransaction(editingTransaction.id, txData);
      setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showNotification('Transaction updated successfully.');
    } else {
      const created = await apiClient.createTransaction(txData);
      setTransactions((prev) => [created, ...prev]);
      showNotification('Transaction recorded successfully.');
    }
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await apiClient.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteId(null);
      showNotification('Transaction removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const token = apiClient.getToken();
    fetch('/api/transactions/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finwell-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('CSV exported successfully.');
      })
      .catch((err) => {
        setError('Failed to export CSV: ' + err.message);
      });
  };

  // Aggregated totals of the filtered set
  const filteredInflow = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount), 0);

  const filteredOutflow = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount), 0);

  const filteredNet = filteredInflow - filteredOutflow;

  const categories = Array.from(new Set(transactions.map((t) => t.category))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Corporate Financial Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Audited Records</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{transactions.length} entries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Transaction Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Query, manage, and categorize employee compensation inflows and living expense debits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, notes, or description..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          {/* Type Segmented Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Flows (In & Out)</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Filter Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
              className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
              className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-6">
            <span>
              Inflow: <strong className="text-emerald-600 font-mono-numbers">+${filteredInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span>
              Outflow: <strong className="text-slate-900 font-mono-numbers">-${filteredOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span>
              Net: <strong className={`font-mono-numbers ${filteredNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {filteredNet >= 0 ? '+' : ''}${filteredNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          {(typeFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery || startDate || endDate) && (
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 animate-pulse rounded"></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No matching transactions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your date range or search keyword, or record a new transaction.
            </p>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 font-semibold">Date</th>
                  <th className="py-3 px-5 font-semibold">Merchant / Entity</th>
                  <th className="py-3 px-5 font-semibold">Category</th>
                  <th className="py-3 px-5 font-semibold">Payment Method</th>
                  <th className="py-3 px-5 font-semibold text-right">Amount</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5 text-slate-600 font-mono-numbers whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{tx.merchant}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{tx.description}</p>
                    </td>
                    <td className="py-3 px-5 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.category}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] text-slate-400 font-mono">· recurring</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td
                      className={`py-3 px-5 font-semibold font-mono-numbers text-right whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsModalOpen(true);
                          }}
                          title="Edit transaction"
                          className="p-1 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          title="Delete transaction"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to permanently delete this transaction? This will recalculate category budget spending immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
