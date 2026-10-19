# Finwell — Employee Financial Wellness Platform

> Enterprise-grade full-stack financial wellness platform featuring paycheck deduction modeling, 401(k) company match optimization, category budget tracking, transaction ledger analytics, and automated 4-pillar financial wellness scoring.

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.2-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?logo=flyway&logoColor=white)](https://flywaydb.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**Finwell** is designed for modern corporate enterprises to empower employees in understanding their total compensation, optimizing pre-tax benefits (401k employer match capture, HSA/FSA), managing month-to-month budgets, and strengthening personal financial resilience.

Built to production standards for Software Development Engineer (SDE) technical portfolio review, this project demonstrates clean multi-tier architecture, relational database schema migrations, progressive tax withholding calculations, stateless JWT security, Spring Boot Actuator observability, and an interactive OpenAPI 3.0 explorer.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer: React 19 + TypeScript + Vite      │
│  - Tailwind CSS, Tabular Numerals, Responsive UI      │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│  Backend Layer: Spring Boot 3 & Express Gateway         │
│  - Spring Security, BCrypt, Spring Data JPA            │
│  - OpenAPI 3.0 / Swagger, Spring Boot Actuator        │
└───────────────────────────▲────────────────────────────┘
                            │ SQL / HikariCP Pool
┌───────────────────────────▼────────────────────────────┐
│  Data Layer: PostgreSQL 16 + Flyway Migrations         │
│  - Versioned DDL (V1__init_schema, V2__seed_demo)      │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Java 21, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Lombok
- **Database & Migrations:** PostgreSQL 16, Flyway Migration Engine
- **API Documentation:** OpenAPI 3.0 & Swagger UI (`/swagger-ui.html`, `/api/docs/spec.json`)
- **Testing:** JUnit 5, Mockito, Spring Boot Integration Tests (`@SpringBootTest`)
- **Infrastructure & CI/CD:** Docker Compose, Dockerfiles, GitHub Actions CI
- **Observability:** Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`, `/actuator/info`)

---

## 🚀 Key Features

1. **Paycheck & 401(k) Match Opportunity Optimizer**
   - Progressive tax withholding simulation (Federal, State brackets, FICA).
   - Pre-tax benefits modeling: HSA/FSA, Health, Dental.
   - **Guaranteed Free Money Engine:** Highlights uncaptured corporate 401(k) matching dollars with 1-click optimization to the company match ceiling.

2. **Consolidated Financial Dashboard**
   - Real-time monthly inflow, outflow, net savings, and savings rate percentage.
   - 6-month historical trend analysis with comparative cashflow graphs.
   - Category-level expense consumption bars dynamically computed from ledger transactions.

3. **Audited Transaction Ledger**
   - Full CRUD operations with multi-criteria filtering (Type, Category, Date range, Search).
   - Direct CSV export (`/api/transactions/export/csv`).
   - Automated budget recalculation triggers on write/delete.

4. **Category Budget Management**
   - Monthly category limit planner with alert thresholds (Normal, 80% Warning, Over-budget).
   - In-place limit adjustment and unallocated discretionary buffer tracking.

5. **4-Pillar Financial Wellness Diagnostic**
   - Quantitative evaluation across:
     - **Emergency Buffer** (months of living expenses covered)
     - **Debt & Leverage** (Debt-to-Income ratio)
     - **Budget Discipline** (category limit adherence)
     - **Retirement & Benefits** (401k match capture & HSA utilization)
   - Prioritized recommendations with estimated annual financial impact.

6. **Interactive System & Actuator Observability**
   - Built-in live telemetry dashboard inspecting JVM heap footprint, uptime, active connections, and database health.
   - Live in-browser OpenAPI 3.0 REST explorer.

---

## 🏃 Quick Start

### Option 1: Docker Compose (Full Stack + PostgreSQL)

```bash
# Clone the repository
git clone https://github.com/your-username/finwell-platform.git
cd finwell-platform

# Spin up PostgreSQL, Spring Boot backend, and React frontend
docker-compose up --build
```

- Web UI: `http://localhost:3000`
- Backend API & Swagger: `http://localhost:8080/swagger-ui.html`
- Actuator Health: `http://localhost:8080/actuator/health`

### Option 2: Local Development

```bash
# 1. Install frontend & gateway dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Test Spring Boot backend (in backend-spring-boot directory)
cd backend-spring-boot
mvn clean test
```

---

## 🔑 Pre-Seeded Demo Accounts

| Account | Email | Role & Salary | Highlights |
| :--- | :--- | :--- | :--- |
| **Alex Chen** | `alex.chen@finwell.corp` | Senior SWE · $132,000 | 100% 401(k) match capture, 6-mo emergency reserve, Exemplary score |
| **Sarah Miller** | `sarah.miller@finwell.corp` | Product Designer · $108,000 | 4.0% 401(k) deferral (forfeiting 2% company match), optimization opportunity |

*Default password for both demo accounts:* `password123` *(or use 1-Click Demo Sign-In in the UI)*.
