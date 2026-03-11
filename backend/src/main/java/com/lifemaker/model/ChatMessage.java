package com.lifemaker.model;

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
}
