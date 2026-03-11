package com.lifemaker.service;

import com.lifemaker.dto.PlazaChatRequest;
import com.lifemaker.dto.PlazaJoinRequest;
import com.lifemaker.dto.PlazaMoveRequest;
import com.lifemaker.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlazaStateServiceTest {

    private final PlazaStateService plazaStateService = new PlazaStateService();

    @Test
    void joinReturnsSnapshotIncludingSelf() {
        User user = new User("user-1", "hero@example.com", "Hero", "hashed-password");

        PlazaStateService.JoinResult result = plazaStateService.join("session-1", user, new PlazaJoinRequest("main"));

        assertEquals("main", result.self().plazaId());
        assertEquals(1, result.participants().size());
        assertEquals(user.getId(), result.participants().get(0).userId());
    }

    @Test
    void moveClampsCoordinatesAndRejectsOlderSequence() {
        User user = new User("user-1", "hero@example.com", "Hero", "hashed-password");
        plazaStateService.join("session-1", user, new PlazaJoinRequest("main"));

        PlazaStateService.MoveResult accepted = plazaStateService.move(
            "session-1",
            user,
            new PlazaMoveRequest("main", 999, -10, "left", true, 2)
        ).orElseThrow();

        PlazaStateService.MoveResult rejected = plazaStateService.move(
            "session-1",
            user,
            new PlazaMoveRequest("main", 40, 40, "right", true, 1)
        ).orElseThrow();

        assertTrue(accepted.accepted());
        assertEquals(92.0, accepted.participant().x());
        assertEquals(14.0, accepted.participant().y());
        assertFalse(rejected.accepted());
        assertEquals(2L, rejected.seq());
    }

    @Test
    void chatSanitizesContentAndLeaveRemovesPresence() {
        User user = new User("user-1", "hero@example.com", "Hero", "hashed-password");
        plazaStateService.join("session-1", user, new PlazaJoinRequest("main"));

        PlazaStateService.ChatResult chatResult = plazaStateService.chat(
            "session-1",
            user,
            new PlazaChatRequest("main", "  hello    plaza   ")
        ).orElseThrow();

        PlazaStateService.LeaveResult leaveResult = plazaStateService.leave("session-1").orElseThrow();

        assertEquals("hello plaza", chatResult.content());
        assertEquals("main", leaveResult.plazaId());
        assertEquals(user.getId(), leaveResult.userId());
    }
}
