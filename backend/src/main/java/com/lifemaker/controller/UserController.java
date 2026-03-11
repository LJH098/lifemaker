package com.lifemaker.controller;

import com.lifemaker.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/me")
    public ResponseEntity<User> me(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
}
