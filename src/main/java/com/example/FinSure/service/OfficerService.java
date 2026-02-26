package com.example.FinSure.service;

import com.example.FinSure.entity.LoanApplication;
import com.example.FinSure.entity.LoanStatus;
import com.example.FinSure.repository.LoanApplicationRepo;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OfficerService {

    private final LoanApplicationRepo loanRepo;

    public OfficerService(LoanApplicationRepo loanRepo) {
        this.loanRepo = loanRepo;
    }

    // 🔹 View all pending loans
    public List<LoanApplication> getPendingLoans() {
        return loanRepo.findByStatus(LoanStatus.APPLIED);
    }

    // 🔹 Approve Loan with EMI Validation
    public String approveLoan(Long loanId) {

        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if (loan.getStatus() != LoanStatus.APPLIED) {
            return "Loan already processed";
        }

        // 🔹 Calculate EMI (10% annual interest)
        double emi = calculateEMI(
                loan.getLoanAmount(),
                10,
                loan.getTenureMonths()
        );

        double allowedLimit = loan.getSalary() * 0.4;

        if (emi > allowedLimit) {
            loan.setStatus(LoanStatus.REJECTED);
            loanRepo.save(loan);
            return "Loan Rejected: EMI exceeds 40% of salary";
        }

        loan.setStatus(LoanStatus.APPROVED);
        loanRepo.save(loan);

        return "Loan Approved Successfully";
    }

    // 🔹 Reject Loan Manually
    public String rejectLoan(Long loanId) {

        LoanApplication loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if (loan.getStatus() != LoanStatus.APPLIED) {
            return "Loan already processed";
        }

        loan.setStatus(LoanStatus.REJECTED);
        loanRepo.save(loan);

        return "Loan Rejected Successfully";
    }

    // 🔹 EMI Calculation Method
    private double calculateEMI(double principal, double annualRate, int months) {

        double monthlyRate = annualRate / (12 * 100);

        double emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
                / (Math.pow(1 + monthlyRate, months) - 1);

        return emi;
    }
}