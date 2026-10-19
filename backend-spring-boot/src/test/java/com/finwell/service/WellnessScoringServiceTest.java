package com.finwell.service;

import com.finwell.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("WellnessScoringService Unit Tests")
class WellnessScoringServiceTest {

    private WellnessScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new WellnessScoringService();
    }

    @Test
    @DisplayName("Should award exemplary score when user has 6+ months emergency fund, low debt, and 6% 401k")
    void testExemplaryWellnessScore() {
        User alex = User.builder()
                .id("u1")
                .annualSalary(BigDecimal.valueOf(130000))
                .emergencyFundBalance(BigDecimal.valueOf(25000)) // > 6 months of 3500
                .totalDebt(BigDecimal.valueOf(5000))             // < 10% DTI
                .employee401kPct(BigDecimal.valueOf(6.0))        // Full match
                .build();

        var report = scoringService.calculateReport(alex, BigDecimal.valueOf(3500));

        assertNotNull(report);
        assertTrue(report.overallScore() >= 80, "Expected overall score >= 80, got: " + report.overallScore());
        assertEquals("EXCELLENT", report.emergency().status());
        assertEquals("EXCELLENT", report.debt().status());
        assertEquals("EXCELLENT", report.retirement().status());
    }

    @Test
    @DisplayName("Should flag needs attention when 401(k) contribution is below employer match threshold")
    void testMissedEmployerMatchPenalty() {
        User sarah = User.builder()
                .id("u2")
                .annualSalary(BigDecimal.valueOf(100000))
                .emergencyFundBalance(BigDecimal.valueOf(10000))
                .totalDebt(BigDecimal.valueOf(20000))
                .employee401kPct(BigDecimal.valueOf(3.0)) // Below 6% match!
                .build();

        var report = scoringService.calculateReport(sarah, BigDecimal.valueOf(3500));

        assertNotNull(report);
        assertEquals("NEEDS_ATTENTION", report.retirement().status());
    }
}
