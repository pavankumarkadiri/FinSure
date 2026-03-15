package com.example.FinSure.dto;

public class CustomerProfileRequest {

    private String fullName;
    private String phone;
    private String city;
    private String occupation;
    private String monthlyGoal;
    private String notes;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(String monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
