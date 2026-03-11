package com.lifemaker.service;

import com.lifemaker.dto.PlazaChatRequest;
import com.lifemaker.dto.PlazaJoinRequest;
import com.lifemaker.dto.PlazaMoveRequest;
import com.lifemaker.model.Avatar;
import com.lifemaker.model.User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class PlazaStateService {

    public static final String DEFAULT_PLAZA_ID = "main";
    private static final double MIN_X = 8;
    private static final double MAX_X = 92;
    private static final double MIN_Y = 14;
    private static final double MAX_Y = 82;

    private static final List<Point> SPAWN_POINTS = List.of(
        new Point(18, 68),
        new Point(28, 60),
        new Point(42, 70),
        new Point(58, 58),
        new Point(72, 66),
        new Point(82, 52),
        new Point(50, 44),
        new Point(22, 42)
    );

    private final Map<String, PlazaPresence> participantsByUserId = new ConcurrentHashMap<>();
    private final Map<String, String> userIdBySessionId = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> spawnIndexByPlazaId = new ConcurrentHashMap<>();

    public synchronized JoinResult join(String sessionId, User user, PlazaJoinRequest request) {
        String plazaId = normalizePlazaId(request == null ? null : request.plazaId());
        Instant now = Instant.now();

        PlazaPresence previousPresence = participantsByUserId.get(user.getId());
        Point spawn = previousPresence != null && Objects.equals(previousPresence.plazaId(), plazaId)
            ? new Point(previousPresence.x(), previousPresence.y())
            : nextSpawn(plazaId);

        PlazaPresence presence = new PlazaPresence(
            user.getId(),
            sessionId,
            plazaId,
            user.getNickname(),
            user.getLevel(),
            user.getAvatar(),
            spawn.x(),
            spawn.y(),
            previousPresence == null ? "down" : previousPresence.direction(),
            false,
            0L,
            now
        );

        if (previousPresence != null && !Objects.equals(previousPresence.sessionId(), sessionId)) {
            userIdBySessionId.remove(previousPresence.sessionId());
        }

        participantsByUserId.put(user.getId(), presence);
        userIdBySessionId.put(sessionId, user.getId());

        List<PlazaPresence> snapshot = participantsByUserId.values().stream()
            .filter(candidate -> Objects.equals(candidate.plazaId(), plazaId))
            .sorted(Comparator.comparing(PlazaPresence::nickname, String.CASE_INSENSITIVE_ORDER))
            .toList();

        return new JoinResult(presence, snapshot);
    }

    public synchronized Optional<MoveResult> move(String sessionId, User user, PlazaMoveRequest request) {
        PlazaPresence presence = resolvePresence(sessionId, user);
        if (presence == null) {
            return Optional.empty();
        }

        long incomingSeq = Math.max(request == null ? 0L : request.seq(), 0L);
        if (incomingSeq <= presence.lastSeq()) {
            return Optional.of(new MoveResult(presence, presence.lastSeq(), false));
        }

        String direction = normalizeDirection(request == null ? null : request.direction());
        Point clamped = clamp(request == null ? presence.x() : request.x(), request == null ? presence.y() : request.y());
        PlazaPresence updated = presence.withMovement(clamped.x(), clamped.y(), direction, request != null && request.moving(), incomingSeq, Instant.now());
        participantsByUserId.put(updated.userId(), updated);

        return Optional.of(new MoveResult(updated, incomingSeq, true));
    }

    public synchronized Optional<ChatResult> chat(String sessionId, User user, PlazaChatRequest request) {
        PlazaPresence presence = resolvePresence(sessionId, user);
        if (presence == null) {
            return Optional.empty();
        }

        String content = sanitizeContent(request == null ? null : request.content());
        if (content.isBlank()) {
            return Optional.empty();
        }

        PlazaPresence updated = presence.withActivity(Instant.now());
        participantsByUserId.put(updated.userId(), updated);
        return Optional.of(new ChatResult(updated, content));
    }

    public synchronized Optional<LeaveResult> leave(String sessionId) {
        String userId = userIdBySessionId.remove(sessionId);
        if (userId == null) {
            return Optional.empty();
        }

        PlazaPresence presence = participantsByUserId.get(userId);
        if (presence == null || !Objects.equals(presence.sessionId(), sessionId)) {
            return Optional.empty();
        }

        participantsByUserId.remove(userId);
        return Optional.of(new LeaveResult(presence.plazaId(), userId));
    }

    private PlazaPresence resolvePresence(String sessionId, User user) {
        String activeUserId = userIdBySessionId.get(sessionId);
        if (activeUserId == null || !Objects.equals(activeUserId, user.getId())) {
            return null;
        }

        PlazaPresence presence = participantsByUserId.get(user.getId());
        if (presence == null || !Objects.equals(presence.sessionId(), sessionId)) {
            return null;
        }

        return presence;
    }

    private Point nextSpawn(String plazaId) {
        AtomicInteger index = spawnIndexByPlazaId.computeIfAbsent(plazaId, ignored -> new AtomicInteger());
        Point candidate = SPAWN_POINTS.get(Math.floorMod(index.getAndIncrement(), SPAWN_POINTS.size()));
        return clamp(candidate.x(), candidate.y());
    }

    private Point clamp(double x, double y) {
        return new Point(
            Math.max(MIN_X, Math.min(MAX_X, x)),
            Math.max(MIN_Y, Math.min(MAX_Y, y))
        );
    }

    private String normalizePlazaId(String plazaId) {
        return plazaId == null || plazaId.isBlank() ? DEFAULT_PLAZA_ID : plazaId.trim();
    }

    private String normalizeDirection(String direction) {
        if (direction == null) {
            return "down";
        }

        return switch (direction.trim().toLowerCase()) {
            case "up", "down", "left", "right" -> direction.trim().toLowerCase();
            default -> "down";
        };
    }

    private String sanitizeContent(String content) {
        if (content == null) {
            return "";
        }

        String sanitized = content.trim().replaceAll("\\s+", " ");
        if (sanitized.length() > 120) {
            return sanitized.substring(0, 120);
        }
        return sanitized;
    }

    public record JoinResult(PlazaPresence self, List<PlazaPresence> participants) {
    }

    public record MoveResult(PlazaPresence participant, long seq, boolean accepted) {
    }

    public record ChatResult(PlazaPresence participant, String content) {
    }

    public record LeaveResult(String plazaId, String userId) {
    }

    public record PlazaPresence(
        String userId,
        String sessionId,
        String plazaId,
        String nickname,
        int level,
        Avatar avatar,
        double x,
        double y,
        String direction,
        boolean moving,
        long lastSeq,
        Instant lastActiveAt
    ) {
        PlazaPresence withMovement(double nextX, double nextY, String nextDirection, boolean nextMoving, long nextSeq, Instant activeAt) {
            return new PlazaPresence(
                userId,
                sessionId,
                plazaId,
                nickname,
                level,
                avatar,
                nextX,
                nextY,
                nextDirection,
                nextMoving,
                nextSeq,
                activeAt
            );
        }

        PlazaPresence withActivity(Instant activeAt) {
            return new PlazaPresence(
                userId,
                sessionId,
                plazaId,
                nickname,
                level,
                avatar,
                x,
                y,
                direction,
                moving,
                lastSeq,
                activeAt
            );
        }
    }

    private record Point(double x, double y) {
    }
}
