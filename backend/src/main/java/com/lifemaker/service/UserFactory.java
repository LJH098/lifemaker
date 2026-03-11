package com.lifemaker.service;

import com.lifemaker.model.Avatar;
import com.lifemaker.model.AvatarColors;
import com.lifemaker.model.User;
import com.lifemaker.model.UserStats;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class UserFactory {
    public User createBaseUser(String email, String nickname, String provider) {
        User user = new User();
        user.setEmail(email);
        user.setNickname(nickname);
        user.setProvider(provider);
        user.setLevel(1);
        user.setExp(0);
        user.setCoins(200);

        AvatarColors colors = new AvatarColors();
        colors.setSkin("#F1C27D");
        colors.setHair("#22C55E");
        colors.setClothes("#38BDF8");

        Avatar avatar = new Avatar();
        avatar.setHair("Starter Cut");
        avatar.setClothes("Novice Hoodie");
        avatar.setAccessories(List.of("Beginner Badge"));
        avatar.setColors(colors);
        user.setAvatar(avatar);

        UserStats stats = new UserStats();
        stats.setFocus(40);
        stats.setKnowledge(35);
        stats.setHealth(30);
        stats.setSocial(25);
        stats.setDiscipline(38);
        user.setStats(stats);
        return user;
    }
}
