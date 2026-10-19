import {
  User,
  Transaction,
  Budget,
  SavingsGoal,
  PaycheckCalculation,
  FinancialWellnessReport,
  DashboardSummary,
  ActuatorHealth,
  ActuatorInfo,
  ActuatorMetrics,
} from '../types/index.ts';

const TOKEN_KEY = 'finwell_auth_token';

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (_) {
        errorMessage = `HTTP error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return res.json() as Promise<T>;
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  },

  async demoLogin(email: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setToken(data.token);
    return data;
  },

  async register(payload: any): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  },

  async getProfile(): Promise<User> {
    return this.request<User>('/api/auth/profile');
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    return this.request<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Dashboard
  async getDashboard(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/api/dashboard');
  },

  // Transactions
  async getTransactions(filters: {
    type?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Transaction[]>(`/api/transactions${query}`);
  },

  async createTransaction(tx: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTransaction(id: string): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  getExportCsvUrl(): string {
    return `/api/transactions/export/csv`;
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>('/api/budgets');
  },

  async createBudget(budget: Partial<Budget>): Promise<Budget> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    return this.request<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteBudget(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  },

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return this.request<SavingsGoal[]>('/api/savings-goals');
  },

  async createSavingsGoal(goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return this.request<SavingsGoal>('/api/savings-goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/savings-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async contributeToGoal(id: string, amount: number): Promise<{ message: string; goal: SavingsGoal }> {
    return this.request<{ message: string; goal: SavingsGoal }>(`/api/savings-goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async deleteSavingsGoal(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/savings-goals/${id}`, {
      method: 'DELETE',
    });
  },

  // Paycheck & Benefits
  async getPaycheck(): Promise<PaycheckCalculation> {
    return this.request<PaycheckCalculation>('/api/paycheck');
  },

  async calculatePaycheck(simulatedParams: any): Promise<PaycheckCalculation> {
    return this.request<PaycheckCalculation>('/api/paycheck/calculate', {
      method: 'POST',
      body: JSON.stringify(simulatedParams),
    });
  },

  // Financial Wellness
  async getWellnessReport(): Promise<FinancialWellnessReport> {
    return this.request<FinancialWellnessReport>('/api/wellness');
  },

  // Actuator
  async getActuatorHealth(): Promise<ActuatorHealth> {
    return this.request<ActuatorHealth>('/actuator/health');
  },

  async getActuatorInfo(): Promise<ActuatorInfo> {
    return this.request<ActuatorInfo>('/actuator/info');
  },

  async getActuatorMetrics(): Promise<ActuatorMetrics> {
    return this.request<ActuatorMetrics>('/actuator/metrics');
  },

  async resetDemoData(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/admin/reset-demo', {
      method: 'POST',
    });
  },
};
