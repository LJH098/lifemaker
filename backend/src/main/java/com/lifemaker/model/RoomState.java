package com.lifemaker.model;

import java.util.ArrayList;
import java.util.List;

public class RoomState {

    private String title;
    private boolean isPublic;
    private String wallTheme;
    private String floorTheme;
    private boolean allowGuestbook;
    private boolean restMode;
    private String moodMessage;
    private String inviteCode;
    private List<PlacedItem> placements;
    private List<GuestbookEntry> guestbookEntries;
    private List<ActivityEntry> activityEntries;

    public RoomState() {
    }

    public RoomState(String title,
                     boolean isPublic,
                     String wallTheme,
                     String floorTheme,
                     boolean allowGuestbook,
                     boolean restMode,
                     String moodMessage,
                     String inviteCode,
                     List<PlacedItem> placements,
                     List<GuestbookEntry> guestbookEntries,
                     List<ActivityEntry> activityEntries) {
        this.title = title;
        this.isPublic = isPublic;
        this.wallTheme = wallTheme;
        this.floorTheme = floorTheme;
        this.allowGuestbook = allowGuestbook;
        this.restMode = restMode;
        this.moodMessage = moodMessage;
        this.inviteCode = inviteCode;
        this.placements = placements == null ? new ArrayList<>() : new ArrayList<>(placements);
        this.guestbookEntries = guestbookEntries == null ? new ArrayList<>() : new ArrayList<>(guestbookEntries);
        this.activityEntries = activityEntries == null ? new ArrayList<>() : new ArrayList<>(activityEntries);
    }

    public static RoomState starter(String nickname, String inviteCode) {
        return new RoomState(
            nickname + "'s Mini Room",
            true,
            "mint",
            "wood",
            true,
            true,
            "Welcome to my room. Stay a while and leave a note.",
            inviteCode,
            List.of(
                new PlacedItem("i-3", 72, 46, 2),
                new PlacedItem("i-5", 24, 74, 1),
                new PlacedItem("i-6", 64, 80, 0)
            ),
            List.of(),
            List.of(new ActivityEntry("welcome", "System", "Room created", "Just now"))
        );
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public String getWallTheme() {
        return wallTheme;
    }

    public void setWallTheme(String wallTheme) {
        this.wallTheme = wallTheme;
    }

    public String getFloorTheme() {
        return floorTheme;
    }

    public void setFloorTheme(String floorTheme) {
        this.floorTheme = floorTheme;
    }

    public boolean isAllowGuestbook() {
        return allowGuestbook;
    }

    public void setAllowGuestbook(boolean allowGuestbook) {
        this.allowGuestbook = allowGuestbook;
    }

    public boolean isRestMode() {
        return restMode;
    }

    public void setRestMode(boolean restMode) {
        this.restMode = restMode;
    }

    public String getMoodMessage() {
        return moodMessage;
    }

    public void setMoodMessage(String moodMessage) {
        this.moodMessage = moodMessage;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public List<PlacedItem> getPlacements() {
        if (placements == null) {
            placements = new ArrayList<>();
        }
        return placements;
    }

    public void setPlacements(List<PlacedItem> placements) {
        this.placements = placements == null ? new ArrayList<>() : new ArrayList<>(placements);
    }

    public List<GuestbookEntry> getGuestbookEntries() {
        if (guestbookEntries == null) {
            guestbookEntries = new ArrayList<>();
        }
        return guestbookEntries;
    }

    public void setGuestbookEntries(List<GuestbookEntry> guestbookEntries) {
        this.guestbookEntries = guestbookEntries == null ? new ArrayList<>() : new ArrayList<>(guestbookEntries);
    }

    public List<ActivityEntry> getActivityEntries() {
        if (activityEntries == null) {
            activityEntries = new ArrayList<>();
        }
        return activityEntries;
    }

    public void setActivityEntries(List<ActivityEntry> activityEntries) {
        this.activityEntries = activityEntries == null ? new ArrayList<>() : new ArrayList<>(activityEntries);
    }

    public static class PlacedItem {
        private String itemId;
        private int x;
        private int y;
        private int layer;

        public PlacedItem() {
        }

        public PlacedItem(String itemId, int x, int y, int layer) {
            this.itemId = itemId;
            this.x = x;
            this.y = y;
            this.layer = layer;
        }

        public String getItemId() {
            return itemId;
        }

        public void setItemId(String itemId) {
            this.itemId = itemId;
        }

        public int getX() {
            return x;
        }

        public void setX(int x) {
            this.x = x;
        }

        public int getY() {
            return y;
        }

        public void setY(int y) {
            this.y = y;
        }

        public int getLayer() {
            return layer;
        }

        public void setLayer(int layer) {
            this.layer = layer;
        }
    }

    public static class GuestbookEntry {
        private String id;
        private String author;
        private String message;
        private String createdAt;

        public GuestbookEntry() {
        }

        public GuestbookEntry(String id, String author, String message, String createdAt) {
            this.id = id;
            this.author = author;
            this.message = message;
            this.createdAt = createdAt;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getAuthor() {
            return author;
        }

        public void setAuthor(String author) {
            this.author = author;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }

    public static class ActivityEntry {
        private String id;
        private String actor;
        private String message;
        private String createdAt;

        public ActivityEntry() {
        }

        public ActivityEntry(String id, String actor, String message, String createdAt) {
            this.id = id;
            this.actor = actor;
            this.message = message;
            this.createdAt = createdAt;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getActor() {
            return actor;
        }

        public void setActor(String actor) {
            this.actor = actor;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }
}
