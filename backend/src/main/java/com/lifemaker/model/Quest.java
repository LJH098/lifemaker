package com.lifemaker.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "quests")
public class Quest {

    @Id
    private String id;
    @Indexed
    private String userId;
    private String title;
    private String description;
    private int rewardExp;
    private int rewardCoin;
    private QuestStatus status;
    private int progress;
    private String category;
    private String difficulty;

    public Quest() {
    }

    public Quest(String id,
                 String userId,
                 String title,
                 String description,
                 int rewardExp,
                 int rewardCoin,
                 QuestStatus status,
                 int progress,
                 String category,
                 String difficulty) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.rewardExp = rewardExp;
        this.rewardCoin = rewardCoin;
        this.status = status;
        this.progress = progress;
        this.category = category;
        this.difficulty = difficulty;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getRewardExp() {
        return rewardExp;
    }

    public void setRewardExp(int rewardExp) {
        this.rewardExp = rewardExp;
    }

    public int getRewardCoin() {
        return rewardCoin;
    }

    public void setRewardCoin(int rewardCoin) {
        this.rewardCoin = rewardCoin;
    }

    public QuestStatus getStatus() {
        return status;
    }

    public void setStatus(QuestStatus status) {
        this.status = status;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
