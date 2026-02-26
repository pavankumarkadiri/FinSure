package com.example.FinSure.controller;
import com.example.FinSure.dto.ApplyLoanRequest;
import com.example.FinSure.entity.LoanApplication;
import com.example.FinSure.service.LoanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    // ✅ Apply for Loan
    @PostMapping("/apply/{userId}")
    public String applyLoan(@PathVariable Long userId,
                            @RequestBody ApplyLoanRequest request) {
        return loanService.applyLoan(userId, request);
    }

    // ✅ View Loans of a Customer
    @GetMapping("/user/{userId}")
    public List<LoanApplication> getUserLoans(@PathVariable Long userId) {
        return loanService.getLoansByUser(userId);
    }
}