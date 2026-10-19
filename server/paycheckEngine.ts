import { User, PaycheckCalculation } from '../src/types/index.ts';

/**
 * Enterprise paycheck deduction and employer 401(k) matching calculator
 */
export function calculatePaycheck(user: User, customSalary?: number): PaycheckCalculation {
  const annualGross = customSalary !== undefined && customSalary > 0 ? customSalary : user.annualSalary;

  let payPeriodsPerYear = 24; // SEMI_MONTHLY
  if (user.payFrequency === 'BI_WEEKLY') payPeriodsPerYear = 26;
  if (user.payFrequency === 'MONTHLY') payPeriodsPerYear = 12;

  const grossPerPaycheck = Math.round((annualGross / payPeriodsPerYear) * 100) / 100;

  // Pre-tax deductions per paycheck
  const employee401kPct = Math.min(Math.max(user.employee401kContributionPct || 0, 0), 50) / 100;
  const employee401k = Math.round(grossPerPaycheck * employee401kPct * 100) / 100;

  // Monthly deductions converted to per-paycheck
  const hsaPerPaycheck = Math.round(((user.hsaMonthlyContribution || 0) * 12 / payPeriodsPerYear) * 100) / 100;
  const healthInsurancePerPaycheck = Math.round(((user.healthInsuranceMonthly || 0) * 12 / payPeriodsPerYear) * 100) / 100;

  const totalPreTax = Math.round((employee401k + hsaPerPaycheck + healthInsurancePerPaycheck) * 100) / 100;

  // Taxable wages per paycheck
  const taxableWages = Math.max(grossPerPaycheck - totalPreTax, 0);

  // Progressive Tax Estimator (Federal, State, FICA)
  // Social Security: 6.2% up to wage base cap (~$168,600)
  const socialSecurity = Math.round(Math.min(grossPerPaycheck, 168600 / payPeriodsPerYear) * 0.062 * 100) / 100;
  // Medicare: 1.45%
  const medicare = Math.round(grossPerPaycheck * 0.0145 * 100) / 100;

  // Federal Withholding bracket approximation based on annual taxable income
  const annualizedTaxable = taxableWages * payPeriodsPerYear;
  let fedRate = 0.12;
  if (annualizedTaxable > 190000) fedRate = 0.32;
  else if (annualizedTaxable > 100000) fedRate = 0.22;
  else if (annualizedTaxable > 47000) fedRate = 0.14;
  else fedRate = 0.10;

  const federalWithholding = Math.round(taxableWages * fedRate * 100) / 100;

  // State Tax approximation (e.g. CA 6-9%, NY 5-7%, TX 0%)
  let stateRate = 0.06;
  if (user.state === 'TX' || user.state === 'FL' || user.state === 'WA' || user.state === 'NV') {
    stateRate = 0.0;
  } else if (user.state === 'CA' || user.state === 'NY') {
    stateRate = 0.075;
  }
  const stateWithholding = Math.round(taxableWages * stateRate * 100) / 100;

  const totalTax = Math.round((federalWithholding + stateWithholding + socialSecurity + medicare) * 100) / 100;

  // Net Take-Home
  const netTakeHome = Math.max(Math.round((grossPerPaycheck - totalPreTax - totalTax) * 100) / 100, 0);
  const takeHomePercentage = grossPerPaycheck > 0 ? Math.round((netTakeHome / grossPerPaycheck) * 1000) / 10 : 0;

  // Employer 401(k) Match calculation:
  // Typical corporate policy: 50% match up to 6% of compensation (= 3% maximum company free money)
  const maxMatchedPct = 0.06;
  const matchRate = 0.50; // 50% match
  const eligibleContributionPct = Math.min(employee401kPct, maxMatchedPct);
  const employer401kMatchPerPaycheck = Math.round(grossPerPaycheck * eligibleContributionPct * matchRate * 100) / 100;
  const annualFreeMoneyMatch = Math.round(employer401kMatchPerPaycheck * payPeriodsPerYear * 100) / 100;
  const isMaximizingMatch = employee401kPct >= maxMatchedPct;

  return {
    annualGross,
    payPeriodsPerYear,
    grossPerPaycheck,
    preTaxDeductions: {
      employee401k,
      hsaFsa: hsaPerPaycheck,
      healthInsurance: healthInsurancePerPaycheck,
      totalPreTax,
    },
    taxes: {
      federalWithholding,
      stateWithholding,
      socialSecurity,
      medicare,
      totalTax,
    },
    employerBenefits: {
      employer401kMatch: employer401kMatchPerPaycheck,
      annualFreeMoneyMatch,
      isMaximizingMatch,
    },
    netTakeHome,
    takeHomePercentage,
  };
}
