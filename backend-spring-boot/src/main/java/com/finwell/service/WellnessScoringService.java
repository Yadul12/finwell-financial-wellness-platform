package com.finwell.service;

import com.finwell.domain.User;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Enterprise 4-Pillar Financial Wellness Diagnostic Service
 */
@Service
public class WellnessScoringService {

    public record PillarScore(String name, int score, int maxScore, String status, String insight) {}

    public record WellnessResult(int overallScore, String rating, PillarScore emergency, PillarScore debt, PillarScore retirement) {}

    public WellnessResult calculateReport(User user, BigDecimal monthlyExpenses) {
        BigDecimal expenses = (monthlyExpenses != null && monthlyExpenses.compareTo(BigDecimal.ZERO) > 0)
                ? monthlyExpenses
                : BigDecimal.valueOf(3500);

        // Pillar 1: Emergency Reserve (0-25)
        BigDecimal monthsSaved = user.getEmergencyFundBalance().divide(expenses, 1, RoundingMode.HALF_UP);
        int emergencyScore;
        String emergencyStatus;
        if (monthsSaved.compareTo(BigDecimal.valueOf(6.0)) >= 0) {
            emergencyScore = 25;
            emergencyStatus = "EXCELLENT";
        } else if (monthsSaved.compareTo(BigDecimal.valueOf(3.0)) >= 0) {
            emergencyScore = 20;
            emergencyStatus = "GOOD";
        } else if (monthsSaved.compareTo(BigDecimal.valueOf(1.0)) >= 0) {
            emergencyScore = 12;
            emergencyStatus = "NEEDS_ATTENTION";
        } else {
            emergencyScore = 5;
            emergencyStatus = "CRITICAL";
        }

        // Pillar 2: Debt-to-Income (0-25)
        BigDecimal dtiPct = user.getTotalDebt().multiply(BigDecimal.valueOf(100))
                .divide(user.getAnnualSalary(), 1, RoundingMode.HALF_UP);
        int debtScore;
        String debtStatus;
        if (dtiPct.compareTo(BigDecimal.valueOf(10.0)) <= 0) {
            debtScore = 25;
            debtStatus = "EXCELLENT";
        } else if (dtiPct.compareTo(BigDecimal.valueOf(25.0)) <= 0) {
            debtScore = 20;
            debtStatus = "GOOD";
        } else if (dtiPct.compareTo(BigDecimal.valueOf(45.0)) <= 0) {
            debtScore = 13;
            debtStatus = "NEEDS_ATTENTION";
        } else {
            debtScore = 6;
            debtStatus = "CRITICAL";
        }

        // Pillar 3: 401(k) and Corporate Match (0-25)
        int retirementScore;
        String retirementStatus;
        if (user.getEmployee401kPct().compareTo(BigDecimal.valueOf(6.0)) >= 0) {
            retirementScore = 25;
            retirementStatus = "EXCELLENT";
        } else {
            retirementScore = 12;
            retirementStatus = "NEEDS_ATTENTION";
        }

        int overallScore = emergencyScore + debtScore + retirementScore + 20; // 20 baseline budget pts
        String rating = overallScore >= 80 ? "EXEMPLARY" : (overallScore >= 65 ? "HEALTHY" : "DEVELOPING");

        return new WellnessResult(
                overallScore,
                rating,
                new PillarScore("Emergency Buffer", emergencyScore, 25, emergencyStatus, monthsSaved + " months of living expenses covered"),
                new PillarScore("Debt & Leverage", debtScore, 25, debtStatus, dtiPct + "% debt-to-income ratio"),
                new PillarScore("Retirement & Benefits", retirementScore, 25, retirementStatus, "401(k) deferral rate: " + user.getEmployee401kPct() + "%")
        );
    }
}
