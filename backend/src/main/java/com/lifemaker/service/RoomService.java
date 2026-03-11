package com.lifemaker.service;

import com.lifemaker.model.Room;
import com.lifemaker.repository.RoomRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room getOrCreateRoom(String userId) {
        return roomRepository.findByUserId(userId).orElseGet(() -> {
            Room room = new Room();
            room.setUserId(userId);
            room.setTitle("QuestRunner's Base");
            room.setPublic(true);
            room.setDecorations(List.of("Desk", "Lamp", "Poster", "Plant"));
            return roomRepository.save(room);
        });
    }
}
