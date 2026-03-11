package com.lifemaker.repository;

import com.lifemaker.model.Room;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByUserId(String userId);
}
