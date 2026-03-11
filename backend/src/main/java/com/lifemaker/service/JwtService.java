package com.lifemaker.service;

import com.lifemaker.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms:604800000}") long expirationMs) {
        byte[] keyBytes;
        if (secret.length() >= 32) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        } else {
            keyBytes = Decoders.BASE64.decode(secret);
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .claims(Map.of("nickname", user.getNickname()))
            .subject(user.getId())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationMs, ChronoUnit.MILLIS)))
            .signWith(secretKey)
            .compact();
    }

    public String extractUserId(String token) {
        try {
            return parseClaims(token).getSubject();
        } catch (Exception ignored) {
            return null;
        }
    }

    public boolean isValid(String token, User user) {
        String subject = extractUserId(token);
        return subject != null && subject.equals(user.getId()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
