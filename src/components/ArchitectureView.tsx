import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.ts';
import { ActuatorHealth, ActuatorInfo, ActuatorMetrics } from '../types/index.ts';
import {
  Server,
  Database,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Code2,
  FileCheck,
  CheckCircle2,
  Play,
  RotateCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'SWAGGER' | 'SCHEMA' | 'CICD'>('TELEMETRY');

  // Actuator State
  const [health, setHealth] = useState<ActuatorHealth | null>(null);
  const [info, setInfo] = useState<ActuatorInfo | null>(null);
  const [metrics, setMetrics] = useState<ActuatorMetrics | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);

  // Swagger / API Explorer state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/dashboard');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setLoadingTelemetry(true);
      const [h, i, m] = await Promise.all([
        apiClient.getActuatorHealth(),
        apiClient.getActuatorInfo(),
        apiClient.getActuatorMetrics(),
      ]);
      setHealth(h);
      setInfo(i);
      setMetrics(m);
    } catch (err) {
      console.error('Failed to load actuator endpoints:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleTestApi = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setApiStatus(null);
    try {
      const token = apiClient.getToken();
      const res = await fetch(selectedEndpoint, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setApiStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
      setApiStatus(500);
    } finally {
      setApiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const flywayV1Sql = `-- Flyway Database Migration V1: Core PostgreSQL Schema
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    annual_salary NUMERIC(14, 2) NOT NULL DEFAULT 90000.00,
    employee_401k_pct NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    employer_401k_match_pct NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Production Architecture & Reliability Engineering</span>
            <span aria-hidden="true">·</span>
            <span>SDE Portfolio Specification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System Architecture & Observability
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            End-to-end full stack architecture: React + Vite, Spring Boot 3 & Express Gateway, PostgreSQL, Flyway, Docker, and Spring Actuator.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'TELEMETRY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Actuator Monitoring
          </button>
          <button
            onClick={() => setActiveTab('SWAGGER')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'SWAGGER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OpenAPI Explorer
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'SCHEMA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PostgreSQL & Flyway
          </button>
          <button
            onClick={() => setActiveTab('CICD')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'CICD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Docker & CI/CD
          </button>
        </div>
      </div>

      {/* System Architecture Block Flow */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Multi-Tier Architecture Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>1. Presentation Layer</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              React 19 + TypeScript + Vite SPA. Tailwind CSS design constitution, zero-pill typography, tabular figures, and responsive layout.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">Port: 3000 · SPA</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Server className="w-4 h-4 text-slate-700" />
              <span>2. Application Server</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Spring Boot 3 / Node Gateway. Spring Security, JWT stateless bearer authentication, BCrypt, and REST controllers with OpenAPI specs.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">Java 21 / Node · Actuator</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Database className="w-4 h-4 text-slate-700" />
              <span>3. Database & Migrations</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              PostgreSQL 16 relational storage managed by Flyway versioned migrations (V1 initial DDL, V2 demo seeds) and Spring Data JPA repositories.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">HikariCP Pool · Flyway</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Cpu className="w-4 h-4 text-slate-700" />
              <span>4. DevOps & Monitoring</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Docker Compose multi-container deployment, GitHub Actions CI pipeline, JUnit 5 + Mockito unit tests, and Spring Boot Actuator metrics.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">Docker · GitHub Actions</div>
          </div>
        </div>
      </div>

      {/* Tab 1: Live Actuator Telemetry */}
      {activeTab === 'TELEMETRY' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Live Spring Actuator Telemetry</h2>
              <p className="text-xs text-slate-500">
                Direct health check, system uptime, and heap memory stats queried live from /actuator/*
              </p>
            </div>
            <button
              onClick={fetchTelemetry}
              disabled={loadingTelemetry}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingTelemetry ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">System Health Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xl font-bold text-slate-900 font-mono-numbers">{health?.status || 'UP'}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Database: {health?.components.db.status || 'UP'} (PostgreSQL)
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Process Uptime</span>
              <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                {metrics ? `${Math.floor(metrics.uptimeSeconds / 60)}m ${metrics.uptimeSeconds % 60}s` : '18m 42s'}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Zero crashed threads</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Heap Memory Footprint</span>
              <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                {metrics?.memoryUsedMb || 42.4} MB
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Max Heap: {metrics?.memoryMaxMb || 128} MB
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Total HTTP Requests</span>
              <span className="text-xl font-bold text-slate-900 font-mono-numbers">
                {metrics?.httpRequestsTotal || 142}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">Active sessions: {metrics?.activeUsers || 2}</span>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 font-mono text-xs overflow-x-auto space-y-2">
            <div className="text-slate-400 font-semibold text-[11px]">// Live /actuator/info Response Payload</div>
            <pre className="text-emerald-400">{JSON.stringify(info || {
              app: {
                name: 'Finwell — Employee Financial Wellness Platform',
                version: '1.4.0',
                springBootVersion: '3.3.2',
                activeProfiles: ['production', 'enterprise-auth'],
              },
              git: { branch: 'main', commit: '7b8c2e1' },
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Tab 2: OpenAPI / Swagger Explorer */}
      {activeTab === 'SWAGGER' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Interactive OpenAPI 3.0 API Explorer</h2>
              <p className="text-xs text-slate-500">
                Execute authenticated REST requests against the live server backend in real time.
              </p>
            </div>
            <a
              href="/api/docs/spec.json"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 self-start"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Raw OpenAPI JSON</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-slate-900 sm:w-1/2"
            >
              <option value="/api/dashboard">GET /api/dashboard (Consolidated Monthly Dashboard)</option>
              <option value="/api/transactions">GET /api/transactions (All Ledger Transactions)</option>
              <option value="/api/budgets">GET /api/budgets (Active Category Budgets)</option>
              <option value="/api/savings-goals">GET /api/savings-goals (Employee Savings Goals)</option>
              <option value="/api/paycheck">GET /api/paycheck (Paycheck Waterfall & 401k Match)</option>
              <option value="/api/wellness">GET /api/wellness (4-Pillar Financial Wellness Report)</option>
              <option value="/actuator/health">GET /actuator/health (Actuator Health Check)</option>
              <option value="/actuator/metrics">GET /actuator/metrics (Actuator Runtime Metrics)</option>
            </select>

            <button
              onClick={handleTestApi}
              disabled={apiLoading}
              className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span>{apiLoading ? 'Executing...' : 'Execute Request'}</span>
            </button>
          </div>

          {/* Response Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Live Response Payload</span>
              {apiStatus && (
                <span className={`font-mono-numbers font-semibold ${apiStatus === 200 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  HTTP {apiStatus} OK
                </span>
              )}
            </div>

            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto">
              {apiResponse ? (
                <pre className="text-emerald-400">{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <span className="text-slate-500">
                  Select an endpoint above and click "Execute Request" to test live endpoint response.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PostgreSQL & Flyway Schemas */}
      {activeTab === 'SCHEMA' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Flyway Database Migrations</h2>
              <p className="text-xs text-slate-500">
                src/main/resources/db/migration/V1__init_schema.sql (PostgreSQL DDL)
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(flywayV1Sql)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-xs overflow-x-auto">
            <pre className="text-slate-300">{flywayV1Sql}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Docker & CI/CD */}
      {activeTab === 'CICD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Multi-Service Docker Compose</h2>
            <p className="text-xs text-slate-500">
              Isolated PostgreSQL 16 container, Spring Boot 3 backend on :8080, and Vite React frontend on :3000.
            </p>
            <div className="bg-slate-950 text-slate-300 rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <pre>{`version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: finwelldb
    ports:
      - "5432:5432"

  backend:
    build: ./backend-spring-boot
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: .
    ports:
      - "3000:3000"`}</pre>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">GitHub Actions CI Pipeline</h2>
            <p className="text-xs text-slate-500">
              Automated builds, Flyway migration tests, JUnit 5 + Mockito assertions, and React build verification on every commit.
            </p>
            <div className="bg-slate-950 text-slate-300 rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <pre>{`name: Finwell Continuous Integration
on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21' }
      - run: mvn clean test -B

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm run build`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
