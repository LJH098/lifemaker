package com.lifemaker.dto;

import java.util.List;

public record PlazaSnapshotResponse(
    String plazaId,
    List<PlazaParticipantResponse> participants
) {
}
