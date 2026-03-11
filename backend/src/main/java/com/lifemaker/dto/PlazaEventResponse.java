package com.lifemaker.dto;

public record PlazaEventResponse(
    String type,
    String plazaId,
    PlazaParticipantResponse participant,
    String userId,
    String content,
    String sentAt,
    Long seq
) {
    public static PlazaEventResponse joined(String plazaId, PlazaParticipantResponse participant) {
        return new PlazaEventResponse("joined", plazaId, participant, participant.userId(), null, null, null);
    }

    public static PlazaEventResponse moved(String plazaId, PlazaParticipantResponse participant, long seq) {
        return new PlazaEventResponse("moved", plazaId, participant, participant.userId(), null, null, seq);
    }

    public static PlazaEventResponse chatted(String plazaId, PlazaParticipantResponse participant, String content, String sentAt) {
        return new PlazaEventResponse("chatted", plazaId, participant, participant.userId(), content, sentAt, null);
    }

    public static PlazaEventResponse left(String plazaId, String userId) {
        return new PlazaEventResponse("left", plazaId, null, userId, null, null, null);
    }
}
