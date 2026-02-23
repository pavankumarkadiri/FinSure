package com.example.FinSure.service;


import com.example.FinSure.dto.LoginRequest;
import com.example.FinSure.dto.RegisterRequest;
import com.example.FinSure.repository.UserRepo;
import com.example.FinSure.entity.User;
import org.springframework.stereotype.Service;



@Service
public class AuthService {

    private final UserRepo userRepo;

    public AuthService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public String register(RegisterRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // plain password (no security)

        userRepo.save(user);

        return "User Registered Successfully";
    }

    public String login(LoginRequest request) {

        User user = userRepo.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return "User not found";
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return "Invalid password";
        }

        return "Login Successful";
    }
}
