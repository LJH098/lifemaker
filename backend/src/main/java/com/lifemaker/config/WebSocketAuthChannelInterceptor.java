package com.lifemaker.config;

import com.lifemaker.model.User;
import com.lifemaker.service.JwtService;
import com.lifemaker.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserService userService;

    public WebSocketAuthChannelInterceptor(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String authHeader = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AccessDeniedException("Missing websocket authorization header.");
        }

        String token = authHeader.substring(7);
        String userId = jwtService.extractUserId(token);
        if (userId == null) {
            throw new AccessDeniedException("Invalid websocket token.");
        }

        User user = userService.findById(userId)
            .filter(candidate -> jwtService.isValid(token, candidate))
            .orElseThrow(() -> new AccessDeniedException("Invalid websocket token."));

        accessor.setUser(new WebSocketUserPrincipal(user));
        return message;
    }
}
