package com.lifemaker.dto;

public class AiQuestResponse {
    private String questTitle;
    private String questDescription;
    private int rewardExp;
    private int rewardCoins;

    public AiQuestResponse(String questTitle, String questDescription, int rewardExp, int rewardCoins) {
        this.questTitle = questTitle;
        this.questDescription = questDescription;
        this.rewardExp = rewardExp;
        this.rewardCoins = rewardCoins;
    }

    public String getQuestTitle() { return questTitle; }
    public String getQuestDescription() { return questDescription; }
    public int getRewardExp() { return rewardExp; }
    public int getRewardCoins() { return rewardCoins; }
}
