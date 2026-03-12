package com.lifemaker.model;

import java.util.List;

public class ChatMessage {

    private String roomId;
    private String type;
    private String senderId;
    private String targetUserId;
    private String senderNickname;
    private String content;
    private String sentAt;
    private Double avatarX;
    private Double avatarY;
    private String avatarPalette;
    private String avatarHair;
    private String avatarClothes;
    private List<String> avatarAccessories;
    private String avatarSkinColor;
    private String avatarHairColor;
    private String avatarClothesColor;

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getSenderNickname() {
        return senderNickname;
    }

    public void setSenderNickname(String senderNickname) {
        this.senderNickname = senderNickname;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSentAt() {
        return sentAt;
    }

    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }

    public Double getAvatarX() {
        return avatarX;
    }

    public void setAvatarX(Double avatarX) {
        this.avatarX = avatarX;
    }

    public Double getAvatarY() {
        return avatarY;
    }

    public void setAvatarY(Double avatarY) {
        this.avatarY = avatarY;
    }

    public String getAvatarPalette() {
        return avatarPalette;
    }

    public void setAvatarPalette(String avatarPalette) {
        this.avatarPalette = avatarPalette;
    }

    public String getAvatarHair() {
        return avatarHair;
    }

    public void setAvatarHair(String avatarHair) {
        this.avatarHair = avatarHair;
    }

    public String getAvatarClothes() {
        return avatarClothes;
    }

    public void setAvatarClothes(String avatarClothes) {
        this.avatarClothes = avatarClothes;
    }

    public List<String> getAvatarAccessories() {
        return avatarAccessories;
    }

    public void setAvatarAccessories(List<String> avatarAccessories) {
        this.avatarAccessories = avatarAccessories;
    }

    public String getAvatarSkinColor() {
        return avatarSkinColor;
    }

    public void setAvatarSkinColor(String avatarSkinColor) {
        this.avatarSkinColor = avatarSkinColor;
    }

    public String getAvatarHairColor() {
        return avatarHairColor;
    }

    public void setAvatarHairColor(String avatarHairColor) {
        this.avatarHairColor = avatarHairColor;
    }

    public String getAvatarClothesColor() {
        return avatarClothesColor;
    }

    public void setAvatarClothesColor(String avatarClothesColor) {
        this.avatarClothesColor = avatarClothesColor;
    }
}
