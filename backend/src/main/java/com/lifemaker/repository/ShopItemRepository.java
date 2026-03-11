package com.lifemaker.repository;

import com.lifemaker.model.ShopItem;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShopItemRepository extends MongoRepository<ShopItem, String> {
}
