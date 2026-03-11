package com.lifemaker.service;

import com.lifemaker.model.ShopItem;
import com.lifemaker.repository.ShopItemRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ShopService {
    private final ShopItemRepository shopItemRepository;

    public ShopService(ShopItemRepository shopItemRepository) {
        this.shopItemRepository = shopItemRepository;
    }

    public List<ShopItem> getItems() {
        if (shopItemRepository.count() == 0) {
            shopItemRepository.saveAll(seedItems());
        }
        return shopItemRepository.findAll();
    }

    private List<ShopItem> seedItems() {
        return List.of(
                item("i-1", "Pixel Blade Hair", "hair", 280, "PX"),
                item("i-2", "Guild Hoodie", "clothes", 420, "HD"),
                item("i-3", "Focus Lamp", "room_furniture", 360, "LP"),
                item("i-4", "Legend Pin", "accessories", 150, "PN"));
    }

    private ShopItem item(String id, String name, String type, int price, String image) {
        ShopItem item = new ShopItem();
        item.setItemId(id);
        item.setName(name);
        item.setType(type);
        item.setPrice(price);
        item.setImage(image);
        return item;
    }
}
