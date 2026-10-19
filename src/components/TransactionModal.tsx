import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../types/index.ts';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => Promise<void>;
  transactionToEdit?: Transaction | null;
}

const CATEGORIES: TransactionCategory[] = [
  'Housing & Rent',
  'Groceries',
  'Dining & Coffee',
  'Utilities & Bills',
  'Transportation',
  'Healthcare & Wellness',
  'Entertainment & Leisure',
  'Shopping & Goods',
  'Salary & Bonus',
  'Investment',
  'Education & Learning',
  'Financial & Savings',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Corporate Debit',
  'Credit Card',
  'ACH Transfer',
  'Direct Deposit',
  'Checking Account',
  'Cash',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState<TransactionCategory>('Groceries');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Corporate Debit');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description);
      setMerchant(transactionToEdit.merchant);
      setDate(transactionToEdit.date);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setIsRecurring(transactionToEdit.isRecurring);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('EXPENSE');
      setCategory('Groceries');
      setAmount('');
      setDescription('');
      setMerchant('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Corporate Debit');
      setIsRecurring(false);
      setNotes('');
    }
    setError(null);
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive dollar amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    if (!merchant.trim()) {
      setError('Please specify the merchant or payer name.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        type,
        category,
        amount: parsedAmount,
        description: description.trim(),
        merchant: merchant.trim(),
        date,
        paymentMethod,
        isRecurring,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {transactionToEdit ? 'Edit Transaction' : 'Log New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Type Selector (Segmented control) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                if (category === 'Salary & Bonus' || category === 'Investment') {
                  setCategory('Groceries');
                }
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'EXPENSE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategory('Salary & Bonus');
                setPaymentMethod('Direct Deposit');
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'INCOME'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono-numbers focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merchant / Entity *
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Trader Joe's, Avalon Rent"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly organic groceries & coffee beans"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                Recurring monthly outlay
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with roommate, tax deductible"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Confirm Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
