package com.example.FinSure.service;

import com.example.FinSure.dto.CustomerProfileRequest;
import com.example.FinSure.dto.CustomerProfileResponse;
import com.example.FinSure.entity.User;
import com.example.FinSure.repository.UserRepo;
import org.springframework.stereotype.Service;

@Service
public class CustomerProfileService {

    private final UserRepo userRepo;

    public CustomerProfileService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public CustomerProfileResponse getProfile(String email) {
        User user = getUserByEmail(email);
        return toResponse(user);
    }

    public CustomerProfileResponse updateProfile(String email, CustomerProfileRequest request) {
        User user = getUserByEmail(email);
        user.setName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setCity(request.getCity());
        user.setOccupation(request.getOccupation());
        user.setMonthlyGoal(request.getMonthlyGoal());
        user.setNotes(request.getNotes());

        return toResponse(userRepo.save(user));
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CustomerProfileResponse toResponse(User user) {
        CustomerProfileResponse response = new CustomerProfileResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getName());
        response.setPhone(user.getPhone());
        response.setCity(user.getCity());
        response.setOccupation(user.getOccupation());
        response.setMonthlyGoal(user.getMonthlyGoal());
        response.setNotes(user.getNotes());
        return response;
    }
}
