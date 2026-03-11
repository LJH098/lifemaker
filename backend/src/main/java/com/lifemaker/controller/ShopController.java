package com.lifemaker.controller;

import com.lifemaker.model.ShopItem;
import com.lifemaker.service.ShopService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shop")
public class ShopController {
    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<ShopItem>> items() {
        return ResponseEntity.ok(shopService.getItems());
    }
}
