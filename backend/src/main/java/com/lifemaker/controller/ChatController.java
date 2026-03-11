package com.lifemaker.controller;

import com.lifemaker.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void send(@Payload ChatMessage message) {
        message.setSentAt(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        String roomId = message.getRoomId() == null || message.getRoomId().isBlank() ? "plaza" : message.getRoomId();
        message.setRoomId(roomId);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }
}
