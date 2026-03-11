package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record RoomUpdateRequest(
    @NotBlank(message = "방 제목을 입력해 주세요.")
    String title,
    boolean isPublic,
    @NotBlank(message = "벽 테마를 선택해 주세요.")
    String wallTheme,
    @NotBlank(message = "바닥 테마를 선택해 주세요.")
    String floorTheme,
    @NotNull(message = "배치 정보가 필요합니다.")
    List<PlacementRequest> placements
) {
    public record PlacementRequest(
        @NotBlank(message = "아이템 ID가 필요합니다.")
        String itemId,
        int x,
        int y,
        int layer
    ) {
    }
}
