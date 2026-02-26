package com.example.FinSure.repository;

import com.example.FinSure.entity.LoanApplication;
import com.example.FinSure.entity.LoanStatus;
import com.example.FinSure.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface LoanApplicationRepo extends JpaRepository<LoanApplication, Long> {

    List<LoanApplication> findByCustomer(User customer);

    List<LoanApplication> findByStatus(LoanStatus status);
}