package com.lifemaker.repository;

import com.lifemaker.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    @Query("{'room.inviteCode': ?0}")
    Optional<User> findByRoomInviteCode(String inviteCode);
}
