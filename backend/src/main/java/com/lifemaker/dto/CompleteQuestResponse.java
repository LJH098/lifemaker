package com.lifemaker.dto;

public record CompleteQuestResponse(
    QuestResponse quest,
    UserResponse user,
    boolean leveledUp,
    int earnedExp,
    int earnedCoins
) {
}
