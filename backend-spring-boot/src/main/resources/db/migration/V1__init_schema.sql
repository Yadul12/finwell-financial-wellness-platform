-- V1__init_schema.sql
-- Flyway Database Migration: Initial Schema for Finwell Financial Wellness Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    employer VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    annual_salary NUMERIC(14, 2) NOT NULL DEFAULT 90000.00,
    pay_frequency VARCHAR(32) NOT NULL DEFAULT 'SEMI_MONTHLY',
    employee_401k_pct NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    employer_401k_match_pct NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    hsa_monthly_contribution NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    health_insurance_monthly NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
    tax_filing_status VARCHAR(32) NOT NULL DEFAULT 'SINGLE',
    state VARCHAR(8) NOT NULL DEFAULT 'CA',
    emergency_fund_balance NUMERIC(14, 2) NOT NULL DEFAULT 15000.00,
    total_debt NUMERIC(14, 2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(64) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);

CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    monthly_limit NUMERIC(12, 2) NOT NULL,
    period VARCHAR(16) NOT NULL,
    alert_threshold_pct INTEGER NOT NULL DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_category_period UNIQUE (user_id, category, period)
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL,
    current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    monthly_contribution NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    color VARCHAR(32) NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
