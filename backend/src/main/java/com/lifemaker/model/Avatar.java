package com.lifemaker.model;

import java.util.ArrayList;
import java.util.List;

public class Avatar {

    private String hair;
    private String clothes;
    private List<String> accessories;
    private Colors colors;

    public Avatar() {
    }

    public Avatar(String hair, String clothes, List<String> accessories, Colors colors) {
        this.hair = hair;
        this.clothes = clothes;
        this.accessories = new ArrayList<>(accessories);
        this.colors = colors;
    }

    public static Avatar starter() {
        return new Avatar(
            "Starter Cut",
            "Novice Hoodie",
            List.of("Beginner Badge"),
            new Colors("#F1C27D", "#22C55E", "#38BDF8")
        );
    }

    public String getHair() {
        return hair;
    }

    public void setHair(String hair) {
        this.hair = hair;
    }

    public String getClothes() {
        return clothes;
    }

    public void setClothes(String clothes) {
        this.clothes = clothes;
    }

    public List<String> getAccessories() {
        return accessories;
    }

    public void setAccessories(List<String> accessories) {
        this.accessories = new ArrayList<>(accessories);
    }

    public Colors getColors() {
        return colors;
    }

    public void setColors(Colors colors) {
        this.colors = colors;
    }

    public static class Colors {
        private String skin;
        private String hair;
        private String clothes;

        public Colors() {
        }

        public Colors(String skin, String hair, String clothes) {
            this.skin = skin;
            this.hair = hair;
            this.clothes = clothes;
        }

        public String getSkin() {
            return skin;
        }

        public void setSkin(String skin) {
            this.skin = skin;
        }

        public String getHair() {
            return hair;
        }

        public void setHair(String hair) {
            this.hair = hair;
        }

        public String getClothes() {
            return clothes;
        }

        public void setClothes(String clothes) {
            this.clothes = clothes;
        }
    }
}
