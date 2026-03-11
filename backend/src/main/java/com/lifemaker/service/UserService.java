package com.lifemaker.service;

import com.lifemaker.dto.AvatarUpdateRequest;
import com.lifemaker.model.Avatar;
import com.lifemaker.model.User;
import com.lifemaker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
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
        user.setAvatar(new Avatar(
            request.hair(),
            request.clothes(),
            request.accessories(),
            new Avatar.Colors(request.skinColor(), request.hairColor(), request.clothesColor())
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
        return userRepository.save(user);
    }

    private void recalculateLevel(User user) {
        int newLevel = 1 + (user.getExp() / 300);
        user.setLevel(newLevel);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
