package com.lifemaker.dto;

import com.lifemaker.model.Quest;

public record QuestResponse(
    String id,
    String title,
    String description,
    int rewardExp,
    int rewardCoin,
    String status,
    int progress,
    String category,
    String difficulty
) {
    public static QuestResponse from(Quest quest) {
        return new QuestResponse(
            quest.getId(),
            quest.getTitle(),
            quest.getDescription(),
            quest.getRewardExp(),
            quest.getRewardCoin(),
            quest.getStatus().name().toLowerCase(),
            quest.getProgress(),
            quest.getCategory(),
            quest.getDifficulty()
        );
    }
}
