package com.lifemaker.config;

import com.lifemaker.model.User;

import java.security.Principal;

public final class WebSocketUserPrincipal implements Principal {

    private final User user;

    public WebSocketUserPrincipal(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String getName() {
        return user.getId();
    }
}
