package com.lifemaker.service;

import com.lifemaker.dto.AvatarUpdateRequest;
import com.lifemaker.dto.RoomGuestbookRequest;
import com.lifemaker.dto.RoomUpdateRequest;
import com.lifemaker.model.Avatar;
import com.lifemaker.model.RoomState;
import com.lifemaker.model.User;
import com.lifemaker.repository.ShopItemRepository;
import com.lifemaker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final DateTimeFormatter ROOM_TIME_FORMATTER = DateTimeFormatter.ofPattern("MM.dd HH:mm");

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
            throw new IllegalArgumentException("Email is already in use.");
        }

        User user = new User(UUID.randomUUID().toString(), normalizedEmail, nickname, passwordEncoder.encode(password));
        ensureRoomDefaults(user);
        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Email or password is incorrect."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Email or password is incorrect.");
        }

        ensureRoomDefaults(user);
        return user;
    }

    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email));
    }

    public User findByInviteCode(String inviteCode) {
        User user = userRepository.findByRoomInviteCode(inviteCode)
            .orElseThrow(() -> new IllegalArgumentException("Room not found for this invite code."));
        ensureRoomDefaults(user);
        return user;
    }

    public User hydrateUser(String userId) {
        User user = findRequired(userId);
        boolean changed = ensureRoomDefaults(user);
        return changed ? userRepository.save(user) : user;
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
        appendActivity(user.getRoom(), user.getNickname(), "Updated avatar look");
        return userRepository.save(user);
    }

    public User updateRoom(String userId, RoomUpdateRequest request) {
        User user = findRequired(userId);
        ensureRoomDefaults(user);

        RoomState currentRoom = user.getRoom();
        RoomState nextRoom = new RoomState(
            request.title(),
            request.isPublic(),
            request.wallTheme(),
            request.floorTheme(),
            request.allowGuestbook(),
            request.restMode(),
            request.moodMessage() == null ? "" : request.moodMessage().trim(),
            currentRoom.getInviteCode(),
            request.placements().stream()
                .filter(placement -> user.getOwnedItemIds().contains(placement.itemId()))
                .map(placement -> new RoomState.PlacedItem(
                    placement.itemId(),
                    Math.max(8, Math.min(92, placement.x())),
                    Math.max(16, Math.min(90, placement.y())),
                    Math.max(0, placement.layer())
                ))
                .collect(Collectors.toList()),
            currentRoom.getGuestbookEntries(),
            currentRoom.getActivityEntries()
        );
        appendActivity(nextRoom, user.getNickname(), "Saved room settings");
        user.setRoom(nextRoom);
        return userRepository.save(user);
    }

    public User addGuestbookEntry(String userId, RoomGuestbookRequest request) {
        User user = findRequired(userId);
        ensureRoomDefaults(user);

        if (!user.getRoom().isAllowGuestbook()) {
            throw new IllegalArgumentException("Guestbook is currently closed.");
        }

        List<RoomState.GuestbookEntry> nextEntries = user.getRoom().getGuestbookEntries();
        nextEntries.add(0, new RoomState.GuestbookEntry(
            UUID.randomUUID().toString(),
            user.getNickname(),
            request.message().trim(),
            nowLabel()
        ));

        if (nextEntries.size() > 12) {
            nextEntries.subList(12, nextEntries.size()).clear();
        }

        appendActivity(user.getRoom(), user.getNickname(), "Left a guestbook note");
        return userRepository.save(user);
    }

    public User addGuestbookEntryToInviteRoom(String visitorUserId, String inviteCode, RoomGuestbookRequest request) {
        User visitor = findRequired(visitorUserId);
        User roomOwner = findByInviteCode(inviteCode);
        ensureRoomDefaults(roomOwner);

        if (!roomOwner.getRoom().isAllowGuestbook()) {
            throw new IllegalArgumentException("Guestbook is currently closed.");
        }

        List<RoomState.GuestbookEntry> nextEntries = roomOwner.getRoom().getGuestbookEntries();
        nextEntries.add(0, new RoomState.GuestbookEntry(
            UUID.randomUUID().toString(),
            visitor.getNickname(),
            request.message().trim(),
            nowLabel()
        ));

        if (nextEntries.size() > 12) {
            nextEntries.subList(12, nextEntries.size()).clear();
        }

        appendActivity(roomOwner.getRoom(), visitor.getNickname(), "Visited and left a guestbook note");
        return userRepository.save(roomOwner);
    }

    public User addRewards(String userId, int exp, int coins) {
        User user = findRequired(userId);
        user.setExp(user.getExp() + exp);
        user.setCoins(user.getCoins() + coins);
        recalculateLevel(user);
        return userRepository.save(user);
    }

    public User findRequired(String userId) {
        User user = findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        ensureRoomDefaults(user);
        return user;
    }

    public User save(User user) {
        user.setOwnedItemIds(user.getOwnedItemIds());
        ensureRoomDefaults(user);
        user.setRoom(user.getRoom());
        return userRepository.save(user);
    }

    private void recalculateLevel(User user) {
        int newLevel = 1 + (user.getExp() / 300);
        user.setLevel(newLevel);
    }

    private void ensureCosmeticOwnership(User user, AvatarUpdateRequest request) {
        if (!isStarterHair(request.hair()) && !ownsItemNamed(user, request.hair(), "hair")) {
            throw new IllegalArgumentException("You can only equip owned hair items.");
        }
        if (!isStarterClothes(request.clothes()) && !ownsItemNamed(user, request.clothes(), "clothes")) {
            throw new IllegalArgumentException("You can only equip owned clothing items.");
        }
        for (String accessory : request.accessories()) {
            if (!isStarterAccessory(accessory) && !ownsItemNamed(user, accessory, "accessories")) {
                throw new IllegalArgumentException("You can only equip owned accessories.");
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

    private boolean ensureRoomDefaults(User user) {
        boolean changed = false;
        RoomState room = user.getRoom();

        if (room.getInviteCode() == null || room.getInviteCode().isBlank()) {
            room.setInviteCode("room-" + user.getId().substring(0, Math.min(8, user.getId().length())));
            changed = true;
        }
        if (room.getMoodMessage() == null) {
            room.setMoodMessage("Welcome to my room.");
            changed = true;
        }
        if (room.getWallTheme() == null || room.getWallTheme().isBlank()) {
            room.setWallTheme("mint");
            changed = true;
        }
        if (room.getFloorTheme() == null || room.getFloorTheme().isBlank()) {
            room.setFloorTheme("wood");
            changed = true;
        }
        if (room.getTitle() == null || room.getTitle().isBlank()) {
            room.setTitle(user.getNickname() + "'s Mini Room");
            changed = true;
        }
        if (room.getGuestbookEntries() == null) {
            room.setGuestbookEntries(List.of());
            changed = true;
        }
        if (room.getActivityEntries() == null || room.getActivityEntries().isEmpty()) {
            room.setActivityEntries(List.of(new RoomState.ActivityEntry("welcome", "System", "Room ready", "Just now")));
            changed = true;
        }

        return changed;
    }

    private void appendActivity(RoomState room, String actor, String message) {
        List<RoomState.ActivityEntry> entries = room.getActivityEntries();
        entries.add(0, new RoomState.ActivityEntry(UUID.randomUUID().toString(), actor, message, nowLabel()));
        if (entries.size() > 12) {
            entries.subList(12, entries.size()).clear();
        }
    }

    private String nowLabel() {
        return LocalDateTime.now().format(ROOM_TIME_FORMATTER);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
