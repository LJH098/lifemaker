package com.lifemaker.dto;

import com.lifemaker.model.Avatar;
import com.lifemaker.model.RoomState;
import com.lifemaker.model.User;
import com.lifemaker.model.UserStats;

import java.util.List;

public record UserResponse(
    String id,
    String email,
    String nickname,
    int level,
    int exp,
    int coins,
    List<String> ownedItemIds,
    RoomResponse room,
    AvatarResponse avatar,
    UserStatsResponse stats
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getNickname(),
            user.getLevel(),
            user.getExp(),
            user.getCoins(),
            List.copyOf(user.getOwnedItemIds()),
            RoomResponse.from(user.getRoom()),
            AvatarResponse.from(user.getAvatar()),
            UserStatsResponse.from(user.getStats())
        );
    }

    public record RoomResponse(
        String title,
        boolean isPublic,
        String wallTheme,
        String floorTheme,
        List<PlacedItemResponse> placements
    ) {
        static RoomResponse from(RoomState roomState) {
            return new RoomResponse(
                roomState.getTitle(),
                roomState.isPublic(),
                roomState.getWallTheme(),
                roomState.getFloorTheme(),
                roomState.getPlacements().stream().map(PlacedItemResponse::from).toList()
            );
        }
    }

    public record PlacedItemResponse(
        String itemId,
        int x,
        int y,
        int layer
    ) {
        static PlacedItemResponse from(RoomState.PlacedItem item) {
            return new PlacedItemResponse(item.getItemId(), item.getX(), item.getY(), item.getLayer());
        }
    }

    public record AvatarResponse(
        String hair,
        String clothes,
        List<String> accessories,
        ColorsResponse colors
    ) {
        static AvatarResponse from(Avatar avatar) {
            return new AvatarResponse(
                avatar.getHair(),
                avatar.getClothes(),
                List.copyOf(avatar.getAccessories()),
                ColorsResponse.from(avatar.getColors())
            );
        }
    }

    public record ColorsResponse(
        String skin,
        String hair,
        String clothes
    ) {
        static ColorsResponse from(Avatar.Colors colors) {
            return new ColorsResponse(colors.getSkin(), colors.getHair(), colors.getClothes());
        }
    }

    public record UserStatsResponse(
        int focus,
        int knowledge,
        int health,
        int social,
        int discipline
    ) {
        static UserStatsResponse from(UserStats stats) {
            return new UserStatsResponse(
                stats.getFocus(),
                stats.getKnowledge(),
                stats.getHealth(),
                stats.getSocial(),
                stats.getDiscipline()
            );
        }
    }
}
