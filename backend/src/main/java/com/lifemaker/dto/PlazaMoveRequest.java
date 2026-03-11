package com.lifemaker.dto;

public record PlazaMoveRequest(
    String plazaId,
    double x,
    double y,
    String direction,
    boolean moving,
    long seq
) {
}
