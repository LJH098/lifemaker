package com.lifemaker.controller;

import com.lifemaker.model.Room;
import com.lifemaker.model.User;
import com.lifemaker.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/me")
    public ResponseEntity<Room> myRoom(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(roomService.getOrCreateRoom(user.getId()));
    }
}
