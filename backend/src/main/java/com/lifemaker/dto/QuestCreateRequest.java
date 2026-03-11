package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;

public class QuestCreateRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    private int rewardExp;
    private int rewardCoin;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getRewardExp() { return rewardExp; }
    public void setRewardExp(int rewardExp) { this.rewardExp = rewardExp; }
    public int getRewardCoin() { return rewardCoin; }
    public void setRewardCoin(int rewardCoin) { this.rewardCoin = rewardCoin; }
}
