package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;

public class AiQuestRequest {
    @NotBlank
    private String goal;
    @NotBlank
    private String currentSituation;

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getCurrentSituation() { return currentSituation; }
    public void setCurrentSituation(String currentSituation) { this.currentSituation = currentSituation; }
}
