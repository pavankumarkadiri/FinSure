package com.example.FinSure.service;

import com.example.FinSure.dto.LoginRequest;
import com.example.FinSure.dto.RegisterRequest;
import com.example.FinSure.entity.Role;
import com.example.FinSure.entity.User;
import com.example.FinSure.repository.UserRepo;
import com.example.FinSure.config.JwtUtil;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepo userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    // 🔹 Register
    public String register(RegisterRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());  // plain password (we'll encrypt later)
        user.setRole(Role.CUSTOMER);              // default role

        userRepo.save(user);

        return "User Registered Successfully";
    }

    // 🔹 Login
    public String login(LoginRequest request) {

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            return "Invalid password";
        }

        // Generate JWT token
        return jwtUtil.generateToken(user.getEmail());
    }
}