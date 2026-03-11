package com.lifemaker.dto;

public record AuthResponse(
    String token,
    UserResponse user
) {
}
