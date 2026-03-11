package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RoomUpdateRequest(
    @NotBlank(message = "Room title is required.")
    String title,
    boolean isPublic,
    boolean allowGuestbook,
    boolean restMode,
    @NotBlank(message = "Wall theme is required.")
    String wallTheme,
    @NotBlank(message = "Floor theme is required.")
    String floorTheme,
    @Size(max = 120, message = "Mood message must be 120 characters or fewer.")
    String moodMessage,
    @NotNull(message = "Placement data is required.")
    List<PlacementRequest> placements
) {
    public record PlacementRequest(
        @NotBlank(message = "Item ID is required.")
        String itemId,
        int x,
        int y,
        int layer
    ) {
    }
}
