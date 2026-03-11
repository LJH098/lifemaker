package com.lifemaker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AvatarUpdateRequest(
    @NotBlank(message = "헤어 스타일을 입력해 주세요.")
    String hair,
    @NotBlank(message = "의상 이름을 입력해 주세요.")
    String clothes,
    @NotNull(message = "액세서리 목록이 필요합니다.")
    @Size(max = 3, message = "액세서리는 최대 3개까지 선택할 수 있습니다.")
    List<String> accessories,
    @NotBlank(message = "스킨 색상을 입력해 주세요.")
    String skinColor,
    @NotBlank(message = "헤어 색상을 입력해 주세요.")
    String hairColor,
    @NotBlank(message = "의상 색상을 입력해 주세요.")
    String clothesColor
) {
}
