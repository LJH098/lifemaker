package com.lifemaker.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.lifemaker.dto.AuthRequest;
import com.lifemaker.dto.AuthResponse;
import com.lifemaker.model.User;
import com.lifemaker.repository.UserRepository;
import com.lifemaker.security.JwtService;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserFactory userFactory;
    private final String googleClientId;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserFactory userFactory,
            @Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userFactory = userFactory;
        this.googleClientId = googleClientId;
    }

    public AuthResponse signup(AuthRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email already registered");
        });
        User user = userFactory.createBaseUser(
                request.getEmail(),
                request.getNickname() == null || request.getNickname().isBlank() ? request.getEmail().split("@")[0] : request.getNickname(),
                "LOCAL");
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser.getId(), savedUser.getEmail()), sanitize(savedUser));
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()), sanitize(user));
    }

    public AuthResponse loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String nickname = (String) payload.get("name");
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> userRepository.save(userFactory.createBaseUser(email, nickname, "GOOGLE")));
            return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()), sanitize(user));
        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException("Google verification failed");
        }
    }

    private User sanitize(User user) {
        user.setPassword(null);
        return user;
    }
}
