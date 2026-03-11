package com.lifemaker.config;

import com.lifemaker.dto.PlazaEventResponse;
import com.lifemaker.service.PlazaStateService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class PlazaSessionEventListener {

    private final PlazaStateService plazaStateService;
    private final SimpMessagingTemplate messagingTemplate;

    public PlazaSessionEventListener(PlazaStateService plazaStateService, SimpMessagingTemplate messagingTemplate) {
        this.plazaStateService = plazaStateService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        if (sessionId == null) {
            return;
        }

        plazaStateService.leave(sessionId)
            .map(result -> PlazaEventResponse.left(result.plazaId(), result.userId()))
            .ifPresent(leftEvent -> messagingTemplate.convertAndSend("/topic/plaza.events", leftEvent));
    }
}
