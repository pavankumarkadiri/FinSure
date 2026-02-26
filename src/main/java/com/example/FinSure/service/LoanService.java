package com.example.FinSure.service;


import com.example.FinSure.dto.ApplyLoanRequest;
import com.example.FinSure.entity.LoanApplication;
import com.example.FinSure.entity.LoanStatus;
import com.example.FinSure.entity.User;
import com.example.FinSure.repository.LoanApplicationRepo;
import com.example.FinSure.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    private final LoanApplicationRepo loanRepo;
    private final UserRepo userRepo;

    public LoanService(LoanApplicationRepo loanRepo, UserRepo userRepo) {
        this.loanRepo = loanRepo;
        this.userRepo = userRepo;
    }
    public List<LoanApplication> getLoansByUser(Long userId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return loanRepo.findByCustomer(user);
    }

    public String applyLoan(Long userId, ApplyLoanRequest request) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LoanApplication loan = new LoanApplication();
        loan.setLoanAmount(request.getLoanAmount());
        loan.setSalary(request.getSalary());
        loan.setTenureMonths(request.getTenureMonths());
        loan.setEmploymentType(request.getEmploymentType());
        loan.setStatus(LoanStatus.APPLIED);
        loan.setCustomer(user);

        loanRepo.save(loan);

        return "Loan Application Submitted Successfully";
    }
}
