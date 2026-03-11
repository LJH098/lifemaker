package com.lifemaker.model;

import java.util.List;

public class Avatar {
    private String hair;
    private String clothes;
    private List<String> accessories;
    private AvatarColors colors;

    public String getHair() { return hair; }
    public void setHair(String hair) { this.hair = hair; }
    public String getClothes() { return clothes; }
    public void setClothes(String clothes) { this.clothes = clothes; }
    public List<String> getAccessories() { return accessories; }
    public void setAccessories(List<String> accessories) { this.accessories = accessories; }
    public AvatarColors getColors() { return colors; }
    public void setColors(AvatarColors colors) { this.colors = colors; }
}
