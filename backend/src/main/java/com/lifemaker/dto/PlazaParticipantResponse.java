package com.lifemaker.dto;

import com.lifemaker.service.PlazaStateService;

public record PlazaParticipantResponse(
    String userId,
    String nickname,
    int level,
    UserResponse.AvatarResponse avatar,
    double x,
    double y,
    String direction,
    boolean moving
) {
    public static PlazaParticipantResponse from(PlazaStateService.PlazaPresence presence) {
        return new PlazaParticipantResponse(
            presence.userId(),
            presence.nickname(),
            presence.level(),
            UserResponse.AvatarResponse.from(presence.avatar()),
            presence.x(),
            presence.y(),
            presence.direction(),
            presence.moving()
        );
    }
}
