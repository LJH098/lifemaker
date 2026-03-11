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
        boolean allowGuestbook,
        boolean restMode,
        String wallTheme,
        String floorTheme,
        String moodMessage,
        String inviteCode,
        List<PlacedItemResponse> placements,
        List<GuestbookEntryResponse> guestbookEntries,
        List<ActivityEntryResponse> activityEntries
    ) {
        static RoomResponse from(RoomState roomState) {
            return new RoomResponse(
                roomState.getTitle(),
                roomState.isPublic(),
                roomState.isAllowGuestbook(),
                roomState.isRestMode(),
                roomState.getWallTheme(),
                roomState.getFloorTheme(),
                roomState.getMoodMessage(),
                roomState.getInviteCode(),
                roomState.getPlacements().stream().map(PlacedItemResponse::from).toList(),
                roomState.getGuestbookEntries().stream().map(GuestbookEntryResponse::from).toList(),
                roomState.getActivityEntries().stream().map(ActivityEntryResponse::from).toList()
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

    public record GuestbookEntryResponse(
        String id,
        String author,
        String message,
        String createdAt
    ) {
        static GuestbookEntryResponse from(RoomState.GuestbookEntry entry) {
            return new GuestbookEntryResponse(entry.getId(), entry.getAuthor(), entry.getMessage(), entry.getCreatedAt());
        }
    }

    public record ActivityEntryResponse(
        String id,
        String actor,
        String message,
        String createdAt
    ) {
        static ActivityEntryResponse from(RoomState.ActivityEntry entry) {
            return new ActivityEntryResponse(entry.getId(), entry.getActor(), entry.getMessage(), entry.getCreatedAt());
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
