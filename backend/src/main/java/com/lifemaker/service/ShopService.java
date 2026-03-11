package com.lifemaker.service;

import com.lifemaker.dto.PurchaseItemResponse;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.ShopItem;
import com.lifemaker.model.User;
import com.lifemaker.repository.ShopItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
        Map<String, ShopItem> defaults = Map.ofEntries(
            Map.entry("i-1", new ShopItem("i-1", "Pixel Blade Hair", "hair", 280, "PX")),
            Map.entry("i-2", new ShopItem("i-2", "Guild Hoodie", "clothes", 420, "HD")),
            Map.entry("i-3", new ShopItem("i-3", "Focus Lamp", "room_furniture", 360, "LP")),
            Map.entry("i-4", new ShopItem("i-4", "Legend Pin", "accessories", 150, "PN")),
            Map.entry("i-5", new ShopItem("i-5", "Mini Plant", "room_furniture", 180, "PL")),
            Map.entry("i-6", new ShopItem("i-6", "Cloud Bed", "room_furniture", 520, "BD")),
            Map.entry("i-7", new ShopItem("i-7", "Neon Poster", "room_furniture", 220, "PT")),
            Map.entry("i-8", new ShopItem("i-8", "Moon Bunny", "accessories", 210, "MB")),
            Map.entry("i-9", new ShopItem("i-9", "Street Snapback", "hair", 260, "SB")),
            Map.entry("i-10", new ShopItem("i-10", "Arcade Jacket", "clothes", 460, "AJ")),
            Map.entry("i-11", new ShopItem("i-11", "Retro Desk", "room_furniture", 410, "DK")),
            Map.entry("i-12", new ShopItem("i-12", "Vinyl Shelf", "room_furniture", 300, "VS")),
            Map.entry("i-13", new ShopItem("i-13", "Mint Rug", "room_furniture", 240, "RG"))
        );

        List<ShopItem> missing = defaults.values().stream()
            .filter(item -> shopItemRepository.findById(item.getItemId()).isEmpty())
            .toList();

        if (!missing.isEmpty()) {
            shopItemRepository.saveAll(missing);
        }
    }
}
