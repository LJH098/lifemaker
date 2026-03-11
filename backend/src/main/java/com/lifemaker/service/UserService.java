package com.lifemaker.service;

import com.lifemaker.dto.AvatarUpdateRequest;
import com.lifemaker.dto.RoomUpdateRequest;
import com.lifemaker.model.Avatar;
import com.lifemaker.model.RoomState;
import com.lifemaker.model.User;
import com.lifemaker.repository.ShopItemRepository;
import com.lifemaker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ShopItemRepository shopItemRepository;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository, ShopItemRepository shopItemRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.shopItemRepository = shopItemRepository;
    }

    public User createUser(String nickname, String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("이미 가입한 이메일입니다.");
        }

        User user = new User(UUID.randomUUID().toString(), normalizedEmail, nickname, passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return user;
    }

    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email));
    }

    public User updateAvatar(String userId, AvatarUpdateRequest request) {
        User user = findRequired(userId);
        ensureCosmeticOwnership(user, request);
        user.setAvatar(new Avatar(
            request.hair(),
            request.clothes(),
            request.accessories(),
            new Avatar.Colors(request.skinColor(), request.hairColor(), request.clothesColor())
        ));
        return userRepository.save(user);
    }

    public User updateRoom(String userId, RoomUpdateRequest request) {
        User user = findRequired(userId);
        user.setRoom(new RoomState(
            request.title(),
            request.isPublic(),
            request.wallTheme(),
            request.floorTheme(),
            request.placements().stream()
                .filter(placement -> user.getOwnedItemIds().contains(placement.itemId()))
                .map(placement -> new RoomState.PlacedItem(
                    placement.itemId(),
                    Math.max(0, Math.min(100, placement.x())),
                    Math.max(0, Math.min(100, placement.y())),
                    Math.max(0, placement.layer())
                ))
                .collect(Collectors.toList())
        ));
        return userRepository.save(user);
    }

    public User addRewards(String userId, int exp, int coins) {
        User user = findRequired(userId);
        user.setExp(user.getExp() + exp);
        user.setCoins(user.getCoins() + coins);
        recalculateLevel(user);
        return userRepository.save(user);
    }

    public User findRequired(String userId) {
        return findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    public User save(User user) {
        user.setOwnedItemIds(user.getOwnedItemIds());
        user.setRoom(user.getRoom());
        return userRepository.save(user);
    }

    private void recalculateLevel(User user) {
        int newLevel = 1 + (user.getExp() / 300);
        user.setLevel(newLevel);
    }

    private void ensureCosmeticOwnership(User user, AvatarUpdateRequest request) {
        if (!isStarterHair(request.hair()) && !ownsItemNamed(user, request.hair(), "hair")) {
            throw new IllegalArgumentException("보유한 헤어 아이템만 장착할 수 있습니다.");
        }
        if (!isStarterClothes(request.clothes()) && !ownsItemNamed(user, request.clothes(), "clothes")) {
            throw new IllegalArgumentException("보유한 의상 아이템만 장착할 수 있습니다.");
        }
        for (String accessory : request.accessories()) {
            if (!isStarterAccessory(accessory) && !ownsItemNamed(user, accessory, "accessories")) {
                throw new IllegalArgumentException("보유한 액세서리만 장착할 수 있습니다.");
            }
        }
    }

    private boolean ownsItemNamed(User user, String itemName, String type) {
        return shopItemRepository.findAll().stream()
            .anyMatch(item -> user.getOwnedItemIds().contains(item.getItemId()) && type.equals(item.getType()) && itemName.equals(item.getName()));
    }

    private boolean isStarterHair(String hair) {
        return switch (hair) {
            case "Starter Cut", "Cyber Cut", "Wave Rider", "Guild Buzz" -> true;
            default -> false;
        };
    }

    private boolean isStarterClothes(String clothes) {
        return switch (clothes) {
            case "Novice Hoodie", "Explorer Jacket", "Focus Armor", "Guild Uniform" -> true;
            default -> false;
        };
    }

    private boolean isStarterAccessory(String accessory) {
        return switch (accessory) {
            case "Beginner Badge", "Focus Charm", "Green Visor", "Lucky Ring" -> true;
            default -> false;
        };
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
