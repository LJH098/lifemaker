package com.lifemaker.dto;

public record PurchaseItemResponse(
    String itemId,
    UserResponse user
) {
}
