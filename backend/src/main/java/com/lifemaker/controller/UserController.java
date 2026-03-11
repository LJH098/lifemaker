package com.lifemaker.controller;

import com.lifemaker.dto.AvatarUpdateRequest;
import com.lifemaker.dto.RoomGuestbookRequest;
import com.lifemaker.dto.RoomUpdateRequest;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.User;
import com.lifemaker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
        return ResponseEntity.ok(UserResponse.from(userService.hydrateUser(user.getId())));
    }

    @GetMapping("/room/by-invite/{inviteCode}")
    public ResponseEntity<UserResponse> roomByInvite(@PathVariable String inviteCode) {
        return ResponseEntity.ok(UserResponse.from(userService.findByInviteCode(inviteCode)));
    }

    @PutMapping("/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@AuthenticationPrincipal User user,
                                                     @Valid @RequestBody AvatarUpdateRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.updateAvatar(user.getId(), request)));
    }

    @PutMapping("/room")
    public ResponseEntity<UserResponse> updateRoom(@AuthenticationPrincipal User user,
                                                   @Valid @RequestBody RoomUpdateRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.updateRoom(user.getId(), request)));
    }

    @PostMapping("/room/guestbook")
    public ResponseEntity<UserResponse> addGuestbookEntry(@AuthenticationPrincipal User user,
                                                          @Valid @RequestBody RoomGuestbookRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.addGuestbookEntry(user.getId(), request)));
    }

    @PostMapping("/room/{inviteCode}/guestbook")
    public ResponseEntity<UserResponse> addGuestbookEntryToInviteRoom(@AuthenticationPrincipal User user,
                                                                      @PathVariable String inviteCode,
                                                                      @Valid @RequestBody RoomGuestbookRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.addGuestbookEntryToInviteRoom(user.getId(), inviteCode, request)));
    }
}
