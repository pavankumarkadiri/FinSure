package com.example.FinSure.controller;

import com.example.FinSure.entity.LoanApplication;
import com.example.FinSure.service.OfficerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    // View all pending loans
    @GetMapping("/loans/pending")
    public List<LoanApplication> getPendingLoans() {
        return officerService.getPendingLoans();
    }

    // Approve
    @PutMapping("/loans/{loanId}/approve")
    public String approveLoan(@PathVariable Long loanId) {
        return officerService.approveLoan(loanId);
    }

    // Reject
    @PutMapping("/loans/{loanId}/reject")
    public String rejectLoan(@PathVariable Long loanId) {
        return officerService.rejectLoan(loanId);
    }
}