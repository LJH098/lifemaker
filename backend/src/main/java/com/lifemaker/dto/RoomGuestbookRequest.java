package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoomGuestbookRequest(
    @NotBlank(message = "Guestbook message is required.")
    @Size(max = 240, message = "Guestbook message must be 240 characters or fewer.")
    String message
) {
}
