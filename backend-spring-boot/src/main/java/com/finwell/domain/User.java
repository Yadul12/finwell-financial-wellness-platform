package com.finwell.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @Column(nullable = false, name = "full_name")
    private String fullName;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String employer;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, precision = 14, scale = 2, name = "annual_salary")
    private BigDecimal annualSalary;

    @Column(nullable = false, length = 32, name = "pay_frequency")
    private String payFrequency;

    @Column(nullable = false, precision = 5, scale = 2, name = "employee_401k_pct")
    private BigDecimal employee401kPct;

    @Column(nullable = false, precision = 5, scale = 2, name = "employer_401k_match_pct")
    private BigDecimal employer401kMatchPct;

    @Column(nullable = false, precision = 10, scale = 2, name = "hsa_monthly_contribution")
    private BigDecimal hsaMonthlyContribution;

    @Column(nullable = false, precision = 10, scale = 2, name = "health_insurance_monthly")
    private BigDecimal healthInsuranceMonthly;

    @Column(nullable = false, length = 32, name = "tax_filing_status")
    private String taxFilingStatus;

    @Column(nullable = false, length = 8)
    private String state;

    @Column(nullable = false, precision = 14, scale = 2, name = "emergency_fund_balance")
    private BigDecimal emergencyFundBalance;

    @Column(nullable = false, precision = 14, scale = 2, name = "total_debt")
    private BigDecimal totalDebt;

    @Column(name = "created_at")
    private Instant createdAt;
}
