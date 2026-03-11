package com.lifemaker.controller;

import com.lifemaker.dto.AvatarUpdateRequest;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.User;
import com.lifemaker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@AuthenticationPrincipal User user,
                                                     @Valid @RequestBody AvatarUpdateRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.updateAvatar(user.getId(), request)));
    }
}
