package com.example.FinSure.controller;

import com.example.FinSure.dto.CustomerProfileRequest;
import com.example.FinSure.dto.CustomerProfileResponse;
import com.example.FinSure.service.CustomerProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    public CustomerProfileController(CustomerProfileService customerProfileService) {
        this.customerProfileService = customerProfileService;
    }

    @GetMapping("/me")
    public CustomerProfileResponse getCurrentCustomerProfile(Authentication authentication) {
        return customerProfileService.getProfile(authentication.getName());
    }

    @PutMapping("/me")
    public CustomerProfileResponse updateCurrentCustomerProfile(@RequestBody CustomerProfileRequest request,
                                                               Authentication authentication) {
        return customerProfileService.updateProfile(authentication.getName(), request);
    }
}
