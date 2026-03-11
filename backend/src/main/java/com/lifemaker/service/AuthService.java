package com.lifemaker.service;

import com.lifemaker.dto.AuthResponse;
import com.lifemaker.dto.LoginRequest;
import com.lifemaker.dto.SignupRequest;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        User user = userService.createUser(request.nickname(), request.email(), request.password());
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userService.authenticate(request.email(), request.password());
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }
}
