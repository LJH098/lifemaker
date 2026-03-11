package com.lifemaker.model;

public class UserStats {

    private int focus;
    private int knowledge;
    private int health;
    private int social;
    private int discipline;

    public UserStats() {
    }

    public UserStats(int focus, int knowledge, int health, int social, int discipline) {
        this.focus = focus;
        this.knowledge = knowledge;
        this.health = health;
        this.social = social;
        this.discipline = discipline;
    }

    public static UserStats starter() {
        return new UserStats(42, 38, 35, 30, 40);
    }

    public int getFocus() {
        return focus;
    }

    public void setFocus(int focus) {
        this.focus = focus;
    }

    public int getKnowledge() {
        return knowledge;
    }

    public void setKnowledge(int knowledge) {
        this.knowledge = knowledge;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public int getSocial() {
        return social;
    }

    public void setSocial(int social) {
        this.social = social;
    }

    public int getDiscipline() {
        return discipline;
    }

    public void setDiscipline(int discipline) {
        this.discipline = discipline;
    }
}
