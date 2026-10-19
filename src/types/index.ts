export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'Salary & Bonus'
  | 'Investment'
  | 'Housing & Rent'
  | 'Groceries'
  | 'Dining & Coffee'
  | 'Utilities & Bills'
  | 'Transportation'
  | 'Healthcare & Wellness'
  | 'Entertainment & Leisure'
  | 'Shopping & Goods'
  | 'Education & Learning'
  | 'Financial & Savings'
  | 'Other';

export type PaymentMethod =
  | 'Direct Deposit'
  | 'ACH Transfer'
  | 'Corporate Debit'
  | 'Credit Card'
  | 'Checking Account'
  | 'Cash';

export interface User {
  id: string;
  email: string;
  fullName: string;
  title: string;
  employer: string;
  department: string;
  annualSalary: number;
  payFrequency: 'BI_WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';
  employee401kContributionPct: number; // e.g. 6.0
  employer401kMatchPct: number; // e.g. 50% of up to 6%
  hsaMonthlyContribution: number;
  healthInsuranceMonthly: number;
  taxFilingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';
  state: string; // e.g., 'CA', 'NY', 'TX'
  emergencyFundBalance: number;
  totalDebt: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  monthlyLimit: number;
  spent: number;
  period: string; // YYYY-MM
  alertThresholdPct: number; // default 80%
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  category: 'EMERGENCY_FUND' | 'HOME_PURCHASE' | 'VACATION' | 'INVESTMENT' | 'DEBT_PAYOFF' | 'EDUCATION' | 'OTHER';
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  isCompleted: boolean;
  color: string;
}

export interface PaycheckCalculation {
  annualGross: number;
  payPeriodsPerYear: number;
  grossPerPaycheck: number;
  preTaxDeductions: {
    employee401k: number;
    hsaFsa: number;
    healthInsurance: number;
    totalPreTax: number;
  };
  taxes: {
    federalWithholding: number;
    stateWithholding: number;
    socialSecurity: number;
    medicare: number;
    totalTax: number;
  };
  employerBenefits: {
    employer401kMatch: number;
    annualFreeMoneyMatch: number;
    isMaximizingMatch: boolean;
  };
  netTakeHome: number;
  takeHomePercentage: number;
}

export interface WellnessPillar {
  name: string;
  score: number; // 0 - 25
  maxScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  insight: string;
  actionableStep: string;
  metric: string;
}

export interface FinancialWellnessReport {
  overallScore: number; // 0 - 100
  rating: 'EXEMPLARY' | 'HEALTHY' | 'DEVELOPING' | 'AT_RISK';
  pillars: {
    emergencyBuffer: WellnessPillar;
    debtToIncome: WellnessPillar;
    budgetDiscipline: WellnessPillar;
    retirementOptimization: WellnessPillar;
  };
  keyRecommendations: Array<{
    id: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    impactDollarsYear?: number;
    category: string;
  }>;
}

export interface DashboardSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRatePct: number;
  totalBudgetLimit: number;
  remainingBudget: number;
  budgetUtilizationPct: number;
  categoryBreakdown: Array<{
    category: TransactionCategory;
    amount: number;
    percentage: number;
    budgetLimit: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
    netSavings: number;
  }>;
  recentTransactions: Transaction[];
  wellnessScore: number;
}

export interface ActuatorHealth {
  status: 'UP' | 'DOWN';
  components: {
    db: {
      status: 'UP' | 'DOWN';
      details: {
        database: string;
        activeConnections: number;
        validationQuery: string;
      };
    };
    diskSpace: {
      status: 'UP';
      details: {
        total: number;
        free: number;
        threshold: number;
      };
    };
    ping: {
      status: 'UP';
    };
  };
}

export interface ActuatorInfo {
  app: {
    name: string;
    description: string;
    version: string;
    javaVersion?: string;
    springBootVersion?: string;
    nodeVersion?: string;
    activeProfiles: string[];
  };
  git: {
    branch: string;
    commit: string;
    time: string;
  };
}

export interface ActuatorMetrics {
  uptimeSeconds: number;
  processCpuUsage: number;
  systemCpuUsage: number;
  memoryUsedMb: number;
  memoryMaxMb: number;
  httpRequestsTotal: number;
  activeUsers: number;
}
