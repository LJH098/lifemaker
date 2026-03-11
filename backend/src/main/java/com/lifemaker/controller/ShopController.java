package com.lifemaker.controller;

import com.lifemaker.dto.PurchaseItemResponse;
import com.lifemaker.model.ShopItem;
import com.lifemaker.model.User;
import com.lifemaker.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<ShopItem>> getItems() {
        return ResponseEntity.ok(shopService.getItems());
    }

    @PostMapping("/purchase/{itemId}")
    public ResponseEntity<PurchaseItemResponse> purchase(@AuthenticationPrincipal User user, @PathVariable String itemId) {
        return ResponseEntity.ok(shopService.purchaseItem(user.getId(), itemId));
    }
}
