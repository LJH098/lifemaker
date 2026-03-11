package com.lifemaker.model;

import java.util.ArrayList;
import java.util.List;

public class RoomState {

    private String title;
    private boolean isPublic;
    private String wallTheme;
    private String floorTheme;
    private List<PlacedItem> placements;

    public RoomState() {
    }

    public RoomState(String title, boolean isPublic, String wallTheme, String floorTheme, List<PlacedItem> placements) {
        this.title = title;
        this.isPublic = isPublic;
        this.wallTheme = wallTheme;
        this.floorTheme = floorTheme;
        this.placements = placements == null ? new ArrayList<>() : new ArrayList<>(placements);
    }

    public static RoomState starter(String nickname) {
        return new RoomState(
            nickname + "'s Mini Room",
            true,
            "mint",
            "wood",
            List.of(
                new PlacedItem("i-3", 70, 48, 2),
                new PlacedItem("i-5", 22, 68, 1),
                new PlacedItem("i-6", 64, 74, 0)
            )
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

    public List<PlacedItem> getPlacements() {
        if (placements == null) {
            placements = new ArrayList<>();
        }
        return placements;
    }

    public void setPlacements(List<PlacedItem> placements) {
        this.placements = placements == null ? new ArrayList<>() : new ArrayList<>(placements);
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
}
