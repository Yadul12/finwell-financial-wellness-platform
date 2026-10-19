import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { PaycheckCalculation } from '../types/index.ts';
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const PaycheckView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [calculation, setCalculation] = useState<PaycheckCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation parameters
  const [simSalary, setSimSalary] = useState<number>(user?.annualSalary || 120000);
  const [sim401kPct, setSim401kPct] = useState<number>(user?.employee401kContributionPct || 6.0);
  const [simHsa, setSimHsa] = useState<number>(user?.hsaMonthlyContribution || 150);
  const [simHealthIns, setSimHealthIns] = useState<number>(user?.healthInsuranceMonthly || 140);
  const [simFrequency, setSimFrequency] = useState<string>(user?.payFrequency || 'SEMI_MONTHLY');
  const [simState, setSimState] = useState<string>(user?.state || 'CA');
  const [isSimulating, setIsSimulating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSimSalary(user.annualSalary);
      setSim401kPct(user.employee401kContributionPct);
      setSimHsa(user.hsaMonthlyContribution);
      setSimHealthIns(user.healthInsuranceMonthly);
      setSimFrequency(user.payFrequency);
      setSimState(user.state);
      runCalculation({
        annualSalary: user.annualSalary,
        employee401kContributionPct: user.employee401kContributionPct,
        hsaMonthlyContribution: user.hsaMonthlyContribution,
        healthInsuranceMonthly: user.healthInsuranceMonthly,
        payFrequency: user.payFrequency,
        state: user.state,
      });
    }
  }, [user]);

  const runCalculation = async (params: any) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.calculatePaycheck(params);
      setCalculation(res);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate paycheck.');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field: string, value: any) => {
    setIsSimulating(true);
    let updated = {
      annualSalary: simSalary,
      employee401kContributionPct: sim401kPct,
      hsaMonthlyContribution: simHsa,
      healthInsuranceMonthly: simHealthIns,
      payFrequency: simFrequency,
      state: simState,
      [field]: value,
    };

    if (field === 'annualSalary') setSimSalary(value);
    if (field === 'employee401kContributionPct') setSim401kPct(value);
    if (field === 'hsaMonthlyContribution') setSimHsa(value);
    if (field === 'healthInsuranceMonthly') setSimHealthIns(value);
    if (field === 'payFrequency') setSimFrequency(value);
    if (field === 'state') setSimState(value);

    runCalculation(updated);
  };

  const handleApplyToProfile = async () => {
    try {
      await updateUser({
        annualSalary: simSalary,
        employee401kContributionPct: sim401kPct,
        hsaMonthlyContribution: simHsa,
        healthInsuranceMonthly: simHealthIns,
        payFrequency: simFrequency as any,
        state: simState,
      });
      setIsSimulating(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update employee profile: ' + err.message);
    }
  };

  const handleMaximize401k = () => {
    handleSliderChange('employee401kContributionPct', 6.0);
  };

  const handleResetToProfile = () => {
    if (user) {
      setSimSalary(user.annualSalary);
      setSim401kPct(user.employee401kContributionPct);
      setSimHsa(user.hsaMonthlyContribution);
      setSimHealthIns(user.healthInsuranceMonthly);
      setSimFrequency(user.payFrequency);
      setSimState(user.state);
      setIsSimulating(false);
      runCalculation({
        annualSalary: user.annualSalary,
        employee401kContributionPct: user.employee401kContributionPct,
        hsaMonthlyContribution: user.hsaMonthlyContribution,
        healthInsuranceMonthly: user.healthInsuranceMonthly,
        payFrequency: user.payFrequency,
        state: user.state,
      });
    }
  };

  if (loading && !calculation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const isMaximizing = sim401kPct >= 6.0;
  const missedMatchAnnual = !isMaximizing ? Math.round(((6.0 - sim401kPct) / 100) * 0.5 * simSalary) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Corporate Compensation & Benefits Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Tax-Advantaged Strategy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Paycheck & 401(k) Optimizer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Model pre-tax deductions, progressive tax withholding brackets, and company matching contributions to optimize your net take-home pay.
          </p>
        </div>

        {isSimulating && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToProfile}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Actual</span>
            </button>
            <button
              onClick={handleApplyToProfile}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Save as Employee Profile</span>
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Profile compensation and benefits deduction settings successfully updated!</span>
        </div>
      )}

      {/* 401(k) Employer Free Money Match Banner */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          isMaximizing
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-amber-50 text-slate-900 border-amber-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className={`w-4 h-4 ${isMaximizing ? 'text-emerald-400' : 'text-amber-600'}`} />
              <span>Corporate 401(k) Matching Policy</span>
            </div>
            <h2 className={`text-xl font-bold ${isMaximizing ? 'text-white' : 'text-slate-900'}`}>
              {isMaximizing
                ? `100% Employer Match Captured: $${calculation?.employerBenefits.annualFreeMoneyMatch.toLocaleString()} / year`
                : `Action Required: You are missing out on ~$${missedMatchAnnual.toLocaleString()} in free corporate match money!`}
            </h2>
            <p className={`text-xs max-w-2xl ${isMaximizing ? 'text-slate-300' : 'text-slate-600'}`}>
              Finwell Technologies provides a 50% company match on all employee contributions up to 6.0% of your gross compensation.
              {!isMaximizing && ` You are currently contributing ${sim401kPct}%, forfeiting guaranteed employer funding.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isMaximizing ? (
              <button
                onClick={handleMaximize401k}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Increase to 6.0% (Capture All Match)</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Max Match Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Deduction Controls (Left) + Waterfall Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Simulation Sliders & Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Paycheck Simulator Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust compensation or deduction variables to project net pay outcome in real time.
            </p>
          </div>

          {/* Input 1: Annual Gross Salary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Annual Gross Salary</label>
              <span className="font-bold font-mono-numbers text-slate-900 text-sm">
                ${simSalary.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="250000"
              step="2000"
              value={simSalary}
              onChange={(e) => handleSliderChange('annualSalary', parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers">
              <span>$50k</span>
              <span>$150k</span>
              <span>$250k</span>
            </div>
          </div>

          {/* Input 2: 401(k) Contribution Pct */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">401(k) Employee Contribution</label>
              <span className="font-bold font-mono-numbers text-slate-900 text-sm">
                {sim401kPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={sim401kPct}
              onChange={(e) => handleSliderChange('employee401kContributionPct', parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers">
              <span>0% (No deferral)</span>
              <span className="text-emerald-600 font-semibold">6% (Company Match Limit)</span>
              <span>20% (Aggressive)</span>
            </div>
          </div>

          {/* Input 3: HSA Contribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">HSA Monthly Contribution</label>
              <span className="font-bold font-mono-numbers text-slate-900 text-sm">
                ${simHsa}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="350"
              step="25"
              value={simHsa}
              onChange={(e) => handleSliderChange('hsaMonthlyContribution', parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Triple tax-advantaged pre-tax health savings account ($4,150 single annual IRS limit).
            </p>
          </div>

          {/* Input 4: Health Insurance & Pay Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pay Schedule
              </label>
              <select
                value={simFrequency}
                onChange={(e) => handleSliderChange('payFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
              >
                <option value="SEMI_MONTHLY">Semi-Monthly (24 checks/yr)</option>
                <option value="BI_WEEKLY">Bi-Weekly (26 checks/yr)</option>
                <option value="MONTHLY">Monthly (12 checks/yr)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State Withholding
              </label>
              <select
                value={simState}
                onChange={(e) => handleSliderChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900"
              >
                <option value="CA">California (CA ~7.5%)</option>
                <option value="NY">New York (NY ~7.5%)</option>
                <option value="TX">Texas (TX 0% state tax)</option>
                <option value="WA">Washington (WA 0% state tax)</option>
                <option value="FL">Florida (FL 0% state tax)</option>
                <option value="IL">Illinois (IL ~4.95%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Waterfall Breakdown (7 cols) */}
        {calculation && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Per-Paycheck Deduction Waterfall</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated for 1 pay period ({calculation.payPeriodsPerYear} pay periods annually)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Net Take-Home</span>
                <span className="text-2xl font-bold text-emerald-700 font-mono-numbers">
                  ${calculation.netTakeHome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({calculation.takeHomePercentage}% of gross)
                </span>
              </div>
            </div>

            {/* Waterfall Line Items */}
            <div className="space-y-3 text-xs">
              {/* Gross Pay */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 text-sm">Gross Pay</span>
                  <p className="text-[11px] text-slate-500">Compensation before any withholdings</p>
                </div>
                <span className="font-bold text-slate-900 text-sm font-mono-numbers">
                  ${calculation.grossPerPaycheck.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Pre-tax Deductions Section */}
              <div className="pt-2">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                  Pre-Tax Benefits Deductions (Reduces Taxable Wages)
                </span>
                <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>401(k) Employee Deferral ({sim401kPct}%)</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.preTaxDeductions.employee401k.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>HSA Health Savings</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.preTaxDeductions.hsaFsa.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Health & Dental Premiums</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.preTaxDeductions.healthInsurance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Withholdings Section */}
              <div className="pt-2">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                  Tax Withholdings (Progressive Brackets)
                </span>
                <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Federal Income Tax Withholding</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.taxes.federalWithholding.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>State Income Tax ({simState})</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.taxes.stateWithholding.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Social Security (FICA 6.2%)</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.taxes.socialSecurity.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Medicare (1.45%)</span>
                    <span className="font-mono-numbers text-slate-900">
                      -${calculation.taxes.medicare.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employer Contribution Note (Extra Money) */}
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>+ Company 401(k) Match (Direct to Retirement)</span>
                  <span className="font-mono-numbers">
                    +${calculation.employerBenefits.employer401kMatch.toFixed(2)} / check
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Does not reduce take-home pay. Deposited directly into your employee retirement account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
