package com.lifemaker.repository;

import com.lifemaker.model.Quest;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestRepository extends MongoRepository<Quest, String> {
    List<Quest> findByUserId(String userId);
}
