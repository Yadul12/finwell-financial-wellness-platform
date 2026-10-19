-- V2__seed_demo_data.sql
-- Flyway Database Migration: Seed realistic corporate accounts and sample transactions

INSERT INTO users (
    id, email, password_hash, full_name, title, employer, department,
    annual_salary, pay_frequency, employee_401k_pct, employer_401k_match_pct,
    hsa_monthly_contribution, health_insurance_monthly, tax_filing_status, state,
    emergency_fund_balance, total_debt
) VALUES (
    'user_alex_001',
    'alex.chen@finwell.corp',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8N6BovjT89HlY3sQeU4Hw2u1/m/b5S', -- 'password123'
    'Alex Chen',
    'Senior Software Engineer',
    'Finwell Technologies Inc.',
    'Core Infrastructure',
    132000.00,
    'SEMI_MONTHLY',
    6.00,
    3.00,
    200.00,
    150.00,
    'SINGLE',
    'CA',
    24500.00,
    8500.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id, email, password_hash, full_name, title, employer, department,
    annual_salary, pay_frequency, employee_401k_pct, employer_401k_match_pct,
    hsa_monthly_contribution, health_insurance_monthly, tax_filing_status, state,
    emergency_fund_balance, total_debt
) VALUES (
    'user_sarah_002',
    'sarah.miller@finwell.corp',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8N6BovjT89HlY3sQeU4Hw2u1/m/b5S', -- 'password123'
    'Sarah Miller',
    'Senior Product Designer',
    'Finwell Technologies Inc.',
    'Design & UX',
    108000.00,
    'BI_WEEKLY',
    4.00,
    2.00,
    100.00,
    130.00,
    'SINGLE',
    'NY',
    12000.00,
    22000.00
) ON CONFLICT (id) DO NOTHING;
