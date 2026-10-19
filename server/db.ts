import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Transaction, Budget, SavingsGoal } from '../src/types/index.ts';

interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'finwell-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const userAlex: StoredUser = {
    id: 'user_alex_001',
    email: 'alex.chen@finwell.corp',
    passwordHash,
    fullName: 'Alex Chen',
    title: 'Senior Software Engineer',
    employer: 'Finwell Technologies Inc.',
    department: 'Core Infrastructure',
    annualSalary: 132000,
    payFrequency: 'SEMI_MONTHLY',
    employee401kContributionPct: 6.0,
    employer401kMatchPct: 3.0, // 50% match up to 6%
    hsaMonthlyContribution: 200,
    healthInsuranceMonthly: 150,
    taxFilingStatus: 'SINGLE',
    state: 'CA',
    emergencyFundBalance: 24500,
    totalDebt: 8500, // low student loan
    createdAt: '2025-01-15T08:00:00Z',
  };

  const userSarah: StoredUser = {
    id: 'user_sarah_002',
    email: 'sarah.miller@finwell.corp',
    passwordHash,
    fullName: 'Sarah Miller',
    title: 'Senior Product Designer',
    employer: 'Finwell Technologies Inc.',
    department: 'Design & UX',
    annualSalary: 108000,
    payFrequency: 'BI_WEEKLY',
    employee401kContributionPct: 4.0, // missing 2% of employer match!
    employer401kMatchPct: 2.0,
    hsaMonthlyContribution: 100,
    healthInsuranceMonthly: 130,
    taxFilingStatus: 'SINGLE',
    state: 'NY',
    emergencyFundBalance: 12000,
    totalDebt: 22000, // higher car + credit debt
    createdAt: '2025-02-01T09:30:00Z',
  };

  const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

  const alexBudgets: Budget[] = [
    { id: 'b_01', userId: userAlex.id, category: 'Housing & Rent', monthlyLimit: 2200, spent: 2200, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_02', userId: userAlex.id, category: 'Groceries', monthlyLimit: 650, spent: 480, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_03', userId: userAlex.id, category: 'Dining & Coffee', monthlyLimit: 450, spent: 395, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_04', userId: userAlex.id, category: 'Utilities & Bills', monthlyLimit: 280, spent: 240, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_05', userId: userAlex.id, category: 'Transportation', monthlyLimit: 350, spent: 210, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_06', userId: userAlex.id, category: 'Healthcare & Wellness', monthlyLimit: 200, spent: 125, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_07', userId: userAlex.id, category: 'Entertainment & Leisure', monthlyLimit: 300, spent: 180, period: currentYearMonth, alertThresholdPct: 80 },
    { id: 'b_08', userId: userAlex.id, category: 'Shopping & Goods', monthlyLimit: 400, spent: 290, period: currentYearMonth, alertThresholdPct: 80 },
  ];

  const alexGoals: SavingsGoal[] = [
    {
      id: 'g_01',
      userId: userAlex.id,
      name: '6-Month Emergency Reserve',
      category: 'EMERGENCY_FUND',
      targetAmount: 30000,
      currentAmount: 24500,
      targetDate: '2027-04-30',
      monthlyContribution: 800,
      isCompleted: false,
      color: '#10b981',
    },
    {
      id: 'g_02',
      userId: userAlex.id,
      name: 'First Home Down Payment',
      category: 'HOME_PURCHASE',
      targetAmount: 85000,
      currentAmount: 42000,
      targetDate: '2028-12-31',
      monthlyContribution: 1200,
      isCompleted: false,
      color: '#3b82f6',
    },
    {
      id: 'g_03',
      userId: userAlex.id,
      name: 'Kyoto Cultural Trip',
      category: 'VACATION',
      targetAmount: 4500,
      currentAmount: 4500,
      targetDate: '2026-11-15',
      monthlyContribution: 500,
      isCompleted: true,
      color: '#f59e0b',
    },
  ];

  // Generate realistic recent transactions for current & previous month
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const prevM = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
  const prevY = now.getMonth() === 0 ? y - 1 : y;

  const alexTransactions: Transaction[] = [
    // Current Month Income
    {
      id: 'tx_01',
      userId: userAlex.id,
      type: 'INCOME',
      category: 'Salary & Bonus',
      amount: 4125.00,
      description: 'Finwell Corp Semi-Monthly Payroll Direct Deposit',
      merchant: 'Finwell Technologies Inc.',
      date: `${y}-${m}-01`,
      paymentMethod: 'Direct Deposit',
      isRecurring: true,
      createdAt: `${y}-${m}-01T08:00:00Z`,
    },
    {
      id: 'tx_02',
      userId: userAlex.id,
      type: 'INCOME',
      category: 'Salary & Bonus',
      amount: 4125.00,
      description: 'Finwell Corp Semi-Monthly Payroll Direct Deposit',
      merchant: 'Finwell Technologies Inc.',
      date: `${y}-${m}-15`,
      paymentMethod: 'Direct Deposit',
      isRecurring: true,
      createdAt: `${y}-${m}-15T08:00:00Z`,
    },
    {
      id: 'tx_03',
      userId: userAlex.id,
      type: 'INCOME',
      category: 'Investment',
      amount: 145.20,
      description: 'Vanguard Index Fund Quarterly Dividend',
      merchant: 'Vanguard Brokerage',
      date: `${y}-${m}-05`,
      paymentMethod: 'ACH Transfer',
      isRecurring: false,
      createdAt: `${y}-${m}-05T12:00:00Z`,
    },
    // Current Month Expenses
    {
      id: 'tx_04',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Housing & Rent',
      amount: 2200.00,
      description: 'Monthly Apartment Rent (Apt 4B)',
      merchant: 'Avalon Bay Communities',
      date: `${y}-${m}-01`,
      paymentMethod: 'ACH Transfer',
      isRecurring: true,
      createdAt: `${y}-${m}-01T09:00:00Z`,
    },
    {
      id: 'tx_05',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 184.50,
      description: 'Weekly organic produce & pantry restock',
      merchant: 'Whole Foods Market',
      date: `${y}-${m}-03`,
      paymentMethod: 'Corporate Debit',
      isRecurring: false,
      createdAt: `${y}-${m}-03T16:30:00Z`,
    },
    {
      id: 'tx_06',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 142.10,
      description: 'Bulk household essentials & proteins',
      merchant: 'Trader Joe\'s',
      date: `${y}-${m}-10`,
      paymentMethod: 'Corporate Debit',
      isRecurring: false,
      createdAt: `${y}-${m}-10T14:15:00Z`,
    },
    {
      id: 'tx_07',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 153.40,
      description: 'Fresh groceries & coffee beans',
      merchant: 'Sprouts Farmers Market',
      date: `${y}-${m}-16`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-16T18:20:00Z`,
    },
    {
      id: 'tx_08',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Utilities & Bills',
      amount: 165.00,
      description: 'Electric & Gas utility billing',
      merchant: 'Pacific Gas & Electric',
      date: `${y}-${m}-04`,
      paymentMethod: 'ACH Transfer',
      isRecurring: true,
      createdAt: `${y}-${m}-04T10:00:00Z`,
    },
    {
      id: 'tx_09',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Utilities & Bills',
      amount: 75.00,
      description: 'Fiber Gigabit Internet',
      merchant: 'Sonic Fiber Telecom',
      date: `${y}-${m}-06`,
      paymentMethod: 'Credit Card',
      isRecurring: true,
      createdAt: `${y}-${m}-06T11:00:00Z`,
    },
    {
      id: 'tx_10',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Dining & Coffee',
      amount: 88.50,
      description: 'Team dinner & artisan pizza',
      merchant: 'Pizzeria Delfina',
      date: `${y}-${m}-07`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-07T20:15:00Z`,
    },
    {
      id: 'tx_11',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Dining & Coffee',
      amount: 24.50,
      description: 'Pour-over and breakfast pastry',
      merchant: 'Blue Bottle Coffee',
      date: `${y}-${m}-09`,
      paymentMethod: 'Corporate Debit',
      isRecurring: false,
      createdAt: `${y}-${m}-09T08:45:00Z`,
    },
    {
      id: 'tx_12',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Dining & Coffee',
      amount: 142.00,
      description: 'Weekend sushi dinner with friends',
      merchant: 'Nara Japanese Cuisine',
      date: `${y}-${m}-12`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-12T19:30:00Z`,
    },
    {
      id: 'tx_13',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Transportation',
      amount: 95.00,
      description: 'Regional commuter transit card recharge',
      merchant: 'Clipper Card Bay Area',
      date: `${y}-${m}-02`,
      paymentMethod: 'Corporate Debit',
      isRecurring: true,
      createdAt: `${y}-${m}-02T08:15:00Z`,
    },
    {
      id: 'tx_14',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Transportation',
      amount: 115.00,
      description: 'Fuel fill-up',
      merchant: 'Chevron Station #492',
      date: `${y}-${m}-11`,
      paymentMethod: 'Corporate Debit',
      isRecurring: false,
      createdAt: `${y}-${m}-11T17:40:00Z`,
    },
    {
      id: 'tx_15',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Healthcare & Wellness',
      amount: 125.00,
      description: 'Monthly climbing gym membership & yoga',
      merchant: 'Movement Climbing Yoga',
      date: `${y}-${m}-05`,
      paymentMethod: 'Credit Card',
      isRecurring: true,
      createdAt: `${y}-${m}-05T07:30:00Z`,
    },
    {
      id: 'tx_16',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Entertainment & Leisure',
      amount: 180.00,
      description: 'Symphony Hall concert tickets (Pair)',
      merchant: 'San Francisco Symphony',
      date: `${y}-${m}-14`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-14T15:00:00Z`,
    },
    {
      id: 'tx_17',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Shopping & Goods',
      amount: 165.00,
      description: 'Ergonomic keyboard wrist rest & USB hub',
      merchant: 'Keychron Official',
      date: `${y}-${m}-08`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-08T13:20:00Z`,
    },
    {
      id: 'tx_18',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Shopping & Goods',
      amount: 125.00,
      description: 'Technical outerwear jacket',
      merchant: 'Patagonia Retail Store',
      date: `${y}-${m}-15`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${y}-${m}-15T16:00:00Z`,
    },
    // Previous Month Sample (for trend calculations)
    {
      id: 'tx_p01',
      userId: userAlex.id,
      type: 'INCOME',
      category: 'Salary & Bonus',
      amount: 8250.00,
      description: 'Finwell Corp Monthly Direct Deposit',
      merchant: 'Finwell Technologies Inc.',
      date: `${prevY}-${prevM}-15`,
      paymentMethod: 'Direct Deposit',
      isRecurring: true,
      createdAt: `${prevY}-${prevM}-15T08:00:00Z`,
    },
    {
      id: 'tx_p02',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Housing & Rent',
      amount: 2200.00,
      description: 'Apartment Rent',
      merchant: 'Avalon Bay Communities',
      date: `${prevY}-${prevM}-01`,
      paymentMethod: 'ACH Transfer',
      isRecurring: true,
      createdAt: `${prevY}-${prevM}-01T09:00:00Z`,
    },
    {
      id: 'tx_p03',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Groceries',
      amount: 610.00,
      description: 'Total monthly groceries',
      merchant: 'Whole Foods Market',
      date: `${prevY}-${prevM}-20`,
      paymentMethod: 'Corporate Debit',
      isRecurring: false,
      createdAt: `${prevY}-${prevM}-20T18:00:00Z`,
    },
    {
      id: 'tx_p04',
      userId: userAlex.id,
      type: 'EXPENSE',
      category: 'Dining & Coffee',
      amount: 420.00,
      description: 'Monthly dining out',
      merchant: 'Various Restaurants',
      date: `${prevY}-${prevM}-25`,
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: `${prevY}-${prevM}-25T21:00:00Z`,
    },
  ];

  return {
    users: [userAlex, userSarah],
    transactions: alexTransactions,
    budgets: alexBudgets,
    savingsGoals: alexGoals,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, falling back to seed:', err);
    }
    const seed = getSeedData();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // User operations
  getUsers(): StoredUser[] {
    return this.data.users;
  }

  getUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Transactions
  getTransactions(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.id === id);
  }

  createTransaction(tx: Transaction): Transaction {
    this.data.transactions.unshift(tx);
    this.recalculateBudgetSpent(tx.userId, tx.category);
    this.save();
    return tx;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    const old = this.data.transactions[idx];
    const updated = { ...old, ...updates };
    this.data.transactions[idx] = updated;
    this.recalculateBudgetSpent(updated.userId, updated.category);
    if (old.category !== updated.category) {
      this.recalculateBudgetSpent(old.userId, old.category);
    }
    this.save();
    return updated;
  }

  deleteTransaction(id: string): boolean {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const removed = this.data.transactions.splice(idx, 1)[0];
    this.recalculateBudgetSpent(removed.userId, removed.category);
    this.save();
    return true;
  }

  // Recalculates spent in budgets for the current month
  private recalculateBudgetSpent(userId: string, category: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const userExpenses = this.data.transactions.filter(
      (t) =>
        t.userId === userId &&
        t.type === 'EXPENSE' &&
        t.category === category &&
        t.date.startsWith(currentMonth)
    );
    const totalSpent = userExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

    const b = this.data.budgets.find(
      (b) => b.userId === userId && b.category === category && b.period === currentMonth
    );
    if (b) {
      b.spent = totalSpent;
    }
  }

  // Budgets
  getBudgets(userId: string): Budget[] {
    const currentMonth = new Date().toISOString().slice(0, 7);
    // ensure spent amounts match current transactions
    const userBudgets = this.data.budgets.filter((b) => b.userId === userId && b.period === currentMonth);
    userBudgets.forEach((b) => {
      const totalSpent = this.data.transactions
        .filter(
          (t) =>
            t.userId === userId &&
            t.type === 'EXPENSE' &&
            t.category === b.category &&
            t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);
      b.spent = Math.round(totalSpent * 100) / 100;
    });
    return userBudgets;
  }

  createBudget(budget: Budget): Budget {
    const currentMonth = new Date().toISOString().slice(0, 7);
    budget.period = budget.period || currentMonth;
    this.data.budgets.push(budget);
    this.recalculateBudgetSpent(budget.userId, budget.category);
    this.save();
    return budget;
  }

  updateBudget(id: string, updates: Partial<Budget>): Budget | undefined {
    const idx = this.data.budgets.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.budgets[idx] = { ...this.data.budgets[idx], ...updates };
    this.save();
    return this.data.budgets[idx];
  }

  deleteBudget(id: string): boolean {
    const idx = this.data.budgets.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.budgets.splice(idx, 1);
    this.save();
    return true;
  }

  // Savings Goals
  getSavingsGoals(userId: string): SavingsGoal[] {
    return this.data.savingsGoals.filter((g) => g.userId === userId);
  }

  createSavingsGoal(goal: SavingsGoal): SavingsGoal {
    this.data.savingsGoals.push(goal);
    this.save();
    return goal;
  }

  updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): SavingsGoal | undefined {
    const idx = this.data.savingsGoals.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    this.data.savingsGoals[idx] = { ...this.data.savingsGoals[idx], ...updates };
    if (this.data.savingsGoals[idx].currentAmount >= this.data.savingsGoals[idx].targetAmount) {
      this.data.savingsGoals[idx].isCompleted = true;
    }
    this.save();
    return this.data.savingsGoals[idx];
  }

  deleteSavingsGoal(id: string): boolean {
    const idx = this.data.savingsGoals.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.data.savingsGoals.splice(idx, 1);
    this.save();
    return true;
  }

  resetToDemo(): void {
    const seed = getSeedData();
    this.data = seed;
    this.save(seed);
  }
}

export const db = new Database();
