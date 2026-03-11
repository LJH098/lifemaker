package com.lifemaker.service;

import com.lifemaker.dto.PurchaseItemResponse;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.ShopItem;
import com.lifemaker.model.User;
import com.lifemaker.repository.ShopItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final UserService userService;

    public ShopService(ShopItemRepository shopItemRepository, UserService userService) {
        this.shopItemRepository = shopItemRepository;
        this.userService = userService;
    }

    public List<ShopItem> getItems() {
        seedItemsIfNeeded();
        return shopItemRepository.findAll();
    }

    public PurchaseItemResponse purchaseItem(String userId, String itemId) {
        seedItemsIfNeeded();
        User user = userService.findRequired(userId);
        ShopItem item = shopItemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("구매할 아이템을 찾을 수 없습니다."));

        if (user.getOwnedItemIds().contains(itemId)) {
            throw new IllegalArgumentException("이미 보유한 아이템입니다.");
        }

        if (user.getCoins() < item.getPrice()) {
            throw new IllegalArgumentException("코인이 부족합니다.");
        }

        user.setCoins(user.getCoins() - item.getPrice());
        user.getOwnedItemIds().add(itemId);
        User updated = userService.save(user);
        return new PurchaseItemResponse(itemId, UserResponse.from(updated));
    }

    private void seedItemsIfNeeded() {
        if (shopItemRepository.count() > 0) {
            return;
        }
        shopItemRepository.saveAll(List.of(
            new ShopItem("i-1", "Pixel Blade Hair", "hair", 280, "PX"),
            new ShopItem("i-2", "Guild Hoodie", "clothes", 420, "HD"),
            new ShopItem("i-3", "Focus Lamp", "room_furniture", 360, "LP"),
            new ShopItem("i-4", "Legend Pin", "accessories", 150, "PN")
        ));
    }
}
