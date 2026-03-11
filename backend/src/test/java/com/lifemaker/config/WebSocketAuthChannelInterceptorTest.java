package com.lifemaker.config;

import com.lifemaker.model.User;
import com.lifemaker.service.JwtService;
import com.lifemaker.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.Principal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class WebSocketAuthChannelInterceptorTest {

    @Test
    void rejectsMissingAuthorizationHeader() {
        JwtService jwtService = mock(JwtService.class);
        UserService userService = mock(UserService.class);
        WebSocketAuthChannelInterceptor interceptor = new WebSocketAuthChannelInterceptor(jwtService, userService);

        Message<byte[]> message = connectMessage(null);

        assertThrows(AccessDeniedException.class, () -> interceptor.preSend(message, null));
    }

    @Test
    void assignsUserPrincipalForValidToken() {
        JwtService jwtService = new JwtService("lifemaker-super-secret-key-for-dev-only-lifemaker-1234567890", 60_000);
        User user = new User("user-1", "hero@example.com", "Hero", new BCryptPasswordEncoder().encode("secret"));
        String token = jwtService.generateToken(user);

        UserService userService = mock(UserService.class);
        when(userService.findById(user.getId())).thenReturn(Optional.of(user));

        WebSocketAuthChannelInterceptor interceptor = new WebSocketAuthChannelInterceptor(jwtService, userService);
        Message<?> intercepted = interceptor.preSend(connectMessage("Bearer " + token), null);
        Principal principal = StompHeaderAccessor.wrap(intercepted).getUser();

        WebSocketUserPrincipal authenticated = assertInstanceOf(WebSocketUserPrincipal.class, principal);
        assertEquals(user.getId(), authenticated.getName());
        assertEquals(user.getNickname(), authenticated.getUser().getNickname());
    }

    private static Message<byte[]> connectMessage(String authorizationHeader) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setSessionId("session-1");
        if (authorizationHeader != null) {
            accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
