import { User, Transaction, Budget, FinancialWellnessReport, WellnessPillar } from '../src/types/index.ts';

export function calculateWellnessReport(
  user: User,
  transactions: Transaction[],
  budgets: Budget[]
): FinancialWellnessReport {
  // 1. Calculate Monthly Expense Average from transactions (or budget limits if no transactions)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'EXPENSE' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetTotal = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const estimatedMonthlyLivingExpenses = currentMonthExpenses > 1000 ? currentMonthExpenses : (budgetTotal > 1000 ? budgetTotal : 3500);

  // Pillar 1: Emergency Fund Buffer (0 - 25 pts)
  // Target: 3 to 6 months of living expenses
  const monthsOfEmergencyExpenses = Math.round((user.emergencyFundBalance / estimatedMonthlyLivingExpenses) * 10) / 10;
  let emergencyScore = 0;
  let emergencyStatus: WellnessPillar['status'] = 'CRITICAL';
  let emergencyInsight = '';
  let emergencyAction = '';

  if (monthsOfEmergencyExpenses >= 6.0) {
    emergencyScore = 25;
    emergencyStatus = 'EXCELLENT';
    emergencyInsight = `Excellent liquidity reserve: ${monthsOfEmergencyExpenses} months of baseline living expenses stored ($${user.emergencyFundBalance.toLocaleString()}).`;
    emergencyAction = 'Maintain emergency reserve in a high-yield savings account (HYSA) earning >= 4.5% APY.';
  } else if (monthsOfEmergencyExpenses >= 3.0) {
    emergencyScore = 20;
    emergencyStatus = 'GOOD';
    emergencyInsight = `Solid safety net: ${monthsOfEmergencyExpenses} months of living expenses ($${user.emergencyFundBalance.toLocaleString()}). Standard benchmark is 6 months.`;
    emergencyAction = 'Auto-allocate $300-$500/mo to reach the optimal 6-month buffer threshold.';
  } else if (monthsOfEmergencyExpenses >= 1.0) {
    emergencyScore = 12;
    emergencyStatus = 'NEEDS_ATTENTION';
    emergencyInsight = `Moderate buffer: ${monthsOfEmergencyExpenses} months covered. An unexpected medical or job event may force high-interest debt.`;
    emergencyAction = 'Redirect non-essential leisure budget to emergency fund until you reach 3 full months.';
  } else {
    emergencyScore = 5;
    emergencyStatus = 'CRITICAL';
    emergencyInsight = `Vulnerable cash buffer: Less than 1 month ($${user.emergencyFundBalance.toLocaleString()}) of basic necessities protected.`;
    emergencyAction = 'Establish a primary $1,000 baseline emergency buffer immediately as top financial priority.';
  }

  // Pillar 2: Debt-to-Income / Debt Load (0 - 25 pts)
  const debtToIncomePct = user.annualSalary > 0 ? (user.totalDebt / user.annualSalary) * 100 : 0;
  let debtScore = 0;
  let debtStatus: WellnessPillar['status'] = 'EXCELLENT';
  let debtInsight = '';
  let debtAction = '';

  if (debtToIncomePct <= 10) {
    debtScore = 25;
    debtStatus = 'EXCELLENT';
    debtInsight = `Minimal debt burden: Total non-mortgage debt is only ${debtToIncomePct.toFixed(1)}% of annual gross income ($${user.totalDebt.toLocaleString()}).`;
    debtAction = 'Keep revolving credit utilization under 10% across all billing cycles to maintain top credit tier.';
  } else if (debtToIncomePct <= 25) {
    debtScore = 20;
    debtStatus = 'GOOD';
    debtInsight = `Manageable debt: Debt load is ${debtToIncomePct.toFixed(1)}% of annual income. Well within healthy lending guidelines.`;
    debtAction = 'Consider using the debt avalanche method (highest interest rate first) for rapid payoff.';
  } else if (debtToIncomePct <= 45) {
    debtScore = 13;
    debtStatus = 'NEEDS_ATTENTION';
    debtInsight = `Elevated debt load: ${debtToIncomePct.toFixed(1)}% of gross salary ($${user.totalDebt.toLocaleString()}). Debt service restricts flexibility.`;
    debtAction = 'Freeze discretionary credit card purchases and look into employer-assisted student loan refinancing.';
  } else {
    debtScore = 6;
    debtStatus = 'CRITICAL';
    debtInsight = `High debt pressure: ${debtToIncomePct.toFixed(1)}% debt-to-income ratio. Immediate debt consolidation advised.`;
    debtAction = 'Consult a certified financial counselor to structure a debt management repayment plan.';
  }

  // Pillar 3: Budget Discipline & Adherence (0 - 25 pts)
  let budgetScore = 20;
  let budgetStatus: WellnessPillar['status'] = 'GOOD';
  let budgetInsight = '';
  let budgetAction = '';

  if (budgets.length > 0) {
    const overBudgetCount = budgets.filter((b) => b.spent > b.monthlyLimit).length;
    const adherenceRate = ((budgets.length - overBudgetCount) / budgets.length) * 100;

    if (adherenceRate === 100) {
      budgetScore = 25;
      budgetStatus = 'EXCELLENT';
      budgetInsight = `Perfect budget adherence: All ${budgets.length} expense categories are within designated limits this period.`;
      budgetAction = 'Consider sweeping unspent category surplus directly into your investment or home savings goal.';
    } else if (adherenceRate >= 75) {
      budgetScore = 19;
      budgetStatus = 'GOOD';
      budgetInsight = `${overBudgetCount} out of ${budgets.length} categories exceeded target limits this month (${adherenceRate.toFixed(0)}% adherence).`;
      budgetAction = 'Review dining out and retail subscriptions to eliminate non-essential category creep.';
    } else {
      budgetScore = 11;
      budgetStatus = 'NEEDS_ATTENTION';
      budgetInsight = `${overBudgetCount} categories over budget. Monthly outlays risk outstripping net take-home pay.`;
      budgetAction = 'Recalibrate realistic budget targets and set proactive 80% notification thresholds.';
    }
  } else {
    budgetScore = 10;
    budgetStatus = 'NEEDS_ATTENTION';
    budgetInsight = 'No active monthly budget categories configured. Spending lacks formal oversight.';
    budgetAction = 'Configure monthly target limits for your top 5 spending categories.';
  }

  // Pillar 4: Retirement & Benefits Optimization (0 - 25 pts)
  // Benchmark: 401(k) capture at or above employer match (6%), plus HSA usage
  let retirementScore = 0;
  let retirementStatus: WellnessPillar['status'] = 'NEEDS_ATTENTION';
  let retirementInsight = '';
  let retirementAction = '';

  const employee401kPct = user.employee401kContributionPct || 0;
  const matchThreshold = 6.0; // standard corporate match

  if (employee401kPct >= matchThreshold) {
    retirementScore = 22;
    if (user.hsaMonthlyContribution >= 150) {
      retirementScore = 25;
      retirementStatus = 'EXCELLENT';
      retirementInsight = `Maximizing employee benefits! Full employer 401(k) match captured (${employee401kPct}%) and actively funding triple-tax-advantaged HSA.`;
      retirementAction = 'Gradually bump 401(k) by 1% each annual compensation review until reaching the IRS statutory limit.';
    } else {
      retirementStatus = 'GOOD';
      retirementInsight = `Full employer 401(k) match secured (${employee401kPct}%). No free employer match money left on the table.`;
      retirementAction = 'Increase HSA contributions to capture pre-tax savings on out-of-pocket health and wellness costs.';
    }
  } else {
    const missedPct = matchThreshold - employee401kPct;
    const missedDollarsYear = Math.round((missedPct / 100) * 0.5 * user.annualSalary);
    retirementScore = Math.max(Math.round((employee401kPct / matchThreshold) * 15), 5);
    retirementStatus = employee401kPct === 0 ? 'CRITICAL' : 'NEEDS_ATTENTION';
    retirementInsight = `Leaving employer match money on the table! Contributing ${employee401kPct}% instead of full ${matchThreshold}% match threshold.`;
    retirementAction = `Increase 401(k) deferral by ${missedPct.toFixed(1)}% to claim an estimated $${missedDollarsYear.toLocaleString()} in free corporate matching annually!`;
  }

  const overallScore = emergencyScore + debtScore + budgetScore + retirementScore;

  let rating: FinancialWellnessReport['rating'] = 'DEVELOPING';
  if (overallScore >= 85) rating = 'EXEMPLARY';
  else if (overallScore >= 70) rating = 'HEALTHY';
  else if (overallScore >= 50) rating = 'DEVELOPING';
  else rating = 'AT_RISK';

  // Recommendations
  const keyRecommendations: FinancialWellnessReport['keyRecommendations'] = [];

  if (employee401kPct < matchThreshold) {
    const missedDollars = Math.round(((matchThreshold - employee401kPct) / 100) * 0.5 * user.annualSalary);
    keyRecommendations.push({
      id: 'rec_401k',
      priority: 'HIGH',
      title: 'Claim 100% of Employer 401(k) Match',
      description: `You are currently deferring ${employee401kPct}%. Bumping your contribution to ${matchThreshold}% unlocks ~$${missedDollars.toLocaleString()} in guaranteed employer-funded matching funds every year.`,
      impactDollarsYear: missedDollars,
      category: 'Retirement & Benefits',
    });
  }

  if (monthsOfEmergencyExpenses < 3.0) {
    keyRecommendations.push({
      id: 'rec_emergency',
      priority: 'HIGH',
      title: 'Accelerate Emergency Buffer to 3 Months',
      description: `Your current emergency buffer is ${monthsOfEmergencyExpenses} months ($${user.emergencyFundBalance.toLocaleString()}). Increasing this to 3 months provides essential peace of mind against unforeseen events.`,
      category: 'Emergency Reserves',
    });
  }

  if (user.hsaMonthlyContribution < 100) {
    keyRecommendations.push({
      id: 'rec_hsa',
      priority: 'MEDIUM',
      title: 'Unlock Triple Tax Advantage with HSA',
      description: 'HSA contributions are tax-deductible, grow tax-free, and withdraw tax-free for qualified medical expenses. Increase monthly deduction to lower current taxable income.',
      impactDollarsYear: 450,
      category: 'Tax Efficiency',
    });
  }

  keyRecommendations.push({
    id: 'rec_hysa',
    priority: 'LOW',
    title: 'Optimize Cash Yield in High-Yield Accounts',
    description: 'Ensure checking balances above 1.5x monthly expenses are routed into interest-bearing high-yield savings (4.5%+ APY) or treasury money market funds.',
    impactDollarsYear: Math.round(user.emergencyFundBalance * 0.045),
    category: 'Cash Optimization',
  });

  return {
    overallScore,
    rating,
    pillars: {
      emergencyBuffer: {
        name: 'Emergency Buffer',
        score: emergencyScore,
        maxScore: 25,
        status: emergencyStatus,
        insight: emergencyInsight,
        actionableStep: emergencyAction,
        metric: `${monthsOfEmergencyExpenses} mo`,
      },
      debtToIncome: {
        name: 'Debt & Leverage',
        score: debtScore,
        maxScore: 25,
        status: debtStatus,
        insight: debtInsight,
        actionableStep: debtAction,
        metric: `${debtToIncomePct.toFixed(1)}% DTI`,
      },
      budgetDiscipline: {
        name: 'Budget Discipline',
        score: budgetScore,
        maxScore: 25,
        status: budgetStatus,
        insight: budgetInsight,
        actionableStep: budgetAction,
        metric: budgets.length > 0 ? `${budgets.filter((b) => b.spent <= b.monthlyLimit).length}/${budgets.length} on track` : 'None configured',
      },
      retirementOptimization: {
        name: '401(k) & Benefits',
        score: retirementScore,
        maxScore: 25,
        status: retirementStatus,
        insight: retirementInsight,
        actionableStep: retirementAction,
        metric: `${employee401kPct}% Deferral`,
      },
    },
    keyRecommendations,
  };
}
