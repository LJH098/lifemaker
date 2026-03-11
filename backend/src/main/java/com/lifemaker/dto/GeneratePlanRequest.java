package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GeneratePlanRequest(
    @NotBlank(message = "목표를 입력해주세요.")
    @Size(min = 4, max = 300, message = "목표는 4자 이상 300자 이하로 입력해주세요.")
    String goal,
    @NotBlank(message = "현재 상황을 입력해주세요.")
    @Size(min = 8, max = 1000, message = "현재 상황은 8자 이상 1000자 이하로 입력해주세요.")
    String currentSituation
) {
}
