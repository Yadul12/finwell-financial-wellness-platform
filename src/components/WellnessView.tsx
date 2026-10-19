import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../api/client.ts';
import { FinancialWellnessReport, WellnessPillar } from '../types/index.ts';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface WellnessViewProps {
  onNavigateTab: (tab: string) => void;
}

export const WellnessView: React.FC<WellnessViewProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [report, setReport] = useState<FinancialWellnessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getWellnessReport();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to generate wellness diagnostic.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [user]);

  if (loading || !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded"></div>
        <div className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const pillars = [
    report.pillars.emergencyBuffer,
    report.pillars.debtToIncome,
    report.pillars.budgetDiscipline,
    report.pillars.retirementOptimization,
  ];

  const getStatusColor = (status: WellnessPillar['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'GOOD':
        return 'text-slate-800 bg-slate-100 border-slate-200';
      case 'NEEDS_ATTENTION':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Corporate Employee Financial Health Index</span>
            <span aria-hidden="true">·</span>
            <span>4 Pillars Methodology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Financial Wellness Advisor
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Holistic diagnostic scoring based on liquidity reserves, leverage ratios, cashflow discipline, and retirement capture.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('paycheck')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Simulate Improvements</span>
        </button>
      </div>

      {/* Hero Score Showcase Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Diagnostic Assessment: {report.rating}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Comprehensive Wellness Rating
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Calculated across 4 quantitative dimensions from your live payroll and transaction records. 
              {report.overallScore >= 80
                ? ' Your financial foundation is outstanding, with strong liquidity and disciplined budgeting.'
                : ' Targeted adjustments to your 401(k) matching or emergency reserves will elevate your resilience.'}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl">
            <div className="text-center">
              <span className="text-5xl font-black text-white font-mono-numbers block tracking-tight">
                {report.overallScore}
              </span>
              <span className="text-[11px] text-slate-400 font-mono-numbers block mt-1">out of 100 max</span>
            </div>
            <div className="h-12 w-px bg-slate-700"></div>
            <div className="space-y-1 text-xs">
              <div className="text-emerald-400 font-semibold">{report.rating} Standing</div>
              <div className="text-slate-400 text-[11px]">{pillars.filter((p) => p.status === 'EXCELLENT').length} of 4 Pillars at Peak</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">The Four Pillars of Financial Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.name}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{pillar.name}</h3>
                  <div className="flex items-center gap-2 font-mono-numbers text-xs">
                    <span className="font-bold text-slate-900">{pillar.score}</span>
                    <span className="text-slate-400">/ {pillar.maxScore} pts</span>
                  </div>
                </div>

                {/* Metric pill-less display */}
                <div className="mt-2 text-xs text-slate-500 font-mono-numbers">
                  Metric: <strong className="text-slate-800">{pillar.metric}</strong>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      pillar.score >= 22
                        ? 'bg-emerald-500'
                        : pillar.score >= 17
                        ? 'bg-slate-800'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${(pillar.score / pillar.maxScore) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                  {pillar.insight}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Advisor Recommendation
                </span>
                <p className="text-xs font-medium text-slate-800">
                  {pillar.actionableStep}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Priority Optimization Opportunities</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Concrete actions with measurable annual dollar impact on your net worth
          </p>
        </div>

        <div className="space-y-3">
          {report.keyRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`font-semibold ${rec.priority === 'HIGH' ? 'text-amber-700' : 'text-slate-500'}`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{rec.category}</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-600 max-w-2xl">{rec.description}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {rec.impactDollarsYear && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Value</span>
                    <span className="text-base font-bold text-emerald-700 font-mono-numbers">
                      +${rec.impactDollarsYear.toLocaleString()}/yr
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onNavigateTab(rec.id === 'rec_401k' ? 'paycheck' : 'budgets')}
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
