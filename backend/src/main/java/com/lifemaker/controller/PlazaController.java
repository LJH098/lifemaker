package com.lifemaker.controller;

import com.lifemaker.config.WebSocketUserPrincipal;
import com.lifemaker.dto.PlazaChatRequest;
import com.lifemaker.dto.PlazaEventResponse;
import com.lifemaker.dto.PlazaJoinRequest;
import com.lifemaker.dto.PlazaMoveRequest;
import com.lifemaker.dto.PlazaParticipantResponse;
import com.lifemaker.dto.PlazaSnapshotResponse;
import com.lifemaker.model.User;
import com.lifemaker.service.PlazaStateService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Controller
public class PlazaController {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final PlazaStateService plazaStateService;
    private final SimpMessageSendingOperations messagingTemplate;

    public PlazaController(PlazaStateService plazaStateService,
                           SimpMessageSendingOperations messagingTemplate) {
        this.plazaStateService = plazaStateService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/plaza.join")
    public void join(@Payload PlazaJoinRequest request, SimpMessageHeaderAccessor headerAccessor) {
        User user = requireUser(headerAccessor);
        String sessionId = requireSessionId(headerAccessor);

        PlazaStateService.JoinResult result = plazaStateService.join(sessionId, user, request);
        PlazaSnapshotResponse snapshot = new PlazaSnapshotResponse(
            result.self().plazaId(),
            result.participants().stream().map(PlazaParticipantResponse::from).toList()
        );

        sendSnapshotToSession(user.getId(), sessionId, snapshot);
        messagingTemplate.convertAndSend(
            "/topic/plaza.events",
            PlazaEventResponse.joined(result.self().plazaId(), PlazaParticipantResponse.from(result.self()))
        );
    }

    @MessageMapping("/plaza.move")
    public void move(@Payload PlazaMoveRequest request, SimpMessageHeaderAccessor headerAccessor) {
        User user = requireUser(headerAccessor);
        String sessionId = requireSessionId(headerAccessor);

        plazaStateService.move(sessionId, user, request)
            .filter(PlazaStateService.MoveResult::accepted)
            .ifPresent(result -> messagingTemplate.convertAndSend(
                "/topic/plaza.events",
                PlazaEventResponse.moved(result.participant().plazaId(), PlazaParticipantResponse.from(result.participant()), result.seq())
            ));
    }

    @MessageMapping("/plaza.chat")
    public void chat(@Payload PlazaChatRequest request, SimpMessageHeaderAccessor headerAccessor) {
        User user = requireUser(headerAccessor);
        String sessionId = requireSessionId(headerAccessor);

        plazaStateService.chat(sessionId, user, request)
            .ifPresent(result -> messagingTemplate.convertAndSend(
                "/topic/plaza.events",
                PlazaEventResponse.chatted(
                    result.participant().plazaId(),
                    PlazaParticipantResponse.from(result.participant()),
                    result.content(),
                    LocalTime.now().format(TIME_FORMATTER)
                )
            ));
    }

    private void sendSnapshotToSession(String userId, String sessionId, PlazaSnapshotResponse snapshot) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        messagingTemplate.convertAndSendToUser(userId, "/queue/plaza.init", snapshot, headerAccessor.getMessageHeaders());
    }

    private User requireUser(SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getUser() instanceof WebSocketUserPrincipal principal) {
            return principal.getUser();
        }
        throw new AccessDeniedException("Unauthenticated websocket session.");
    }

    private String requireSessionId(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalStateException("Missing websocket session id.");
        }
        return sessionId;
    }
}
