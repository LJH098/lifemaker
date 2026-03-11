package com.lifemaker.repository;

import com.lifemaker.model.Quest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuestRepository extends MongoRepository<Quest, String> {
    List<Quest> findByUserIdOrderByStatusAscTitleAsc(String userId);
    Optional<Quest> findByIdAndUserId(String id, String userId);
}
