package com.lifemaker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifemaker.dto.AiQuestRequest;
import com.lifemaker.dto.AiQuestResponse;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiQuestService {
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiQuestService(@Value("${app.openai.api-key}") String apiKey, @Value("${app.openai.model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public AiQuestResponse generateQuest(AiQuestRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackQuest(request);
        }

        try {
            String prompt = """
                    You are a life-RPG quest designer.
                    Return JSON with keys questTitle, questDescription, rewardExp, rewardCoins.
                    Goal: %s
                    Current Situation: %s
                    Keep it practical and short.
                    """.formatted(request.getGoal(), request.getCurrentSituation());

            String body = objectMapper.writeValueAsString(
                    objectMapper.createObjectNode()
                            .put("model", model)
                            .set("input", objectMapper.createArrayNode().add(
                                    objectMapper.createObjectNode()
                                            .put("role", "user")
                                            .put("content", prompt))));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/responses"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(httpRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("output").get(0).path("content").get(0).path("text").asText();
            JsonNode parsed = objectMapper.readTree(text);
            return new AiQuestResponse(
                    parsed.path("questTitle").asText(),
                    parsed.path("questDescription").asText(),
                    parsed.path("rewardExp").asInt(80),
                    parsed.path("rewardCoins").asInt(120));
        } catch (Exception ignored) {
            return fallbackQuest(request);
        }
    }

    private AiQuestResponse fallbackQuest(AiQuestRequest request) {
        return new AiQuestResponse(
                request.getGoal() + "을 위한 30분 집중 미션",
                request.getCurrentSituation() + "를 개선하기 위해 가장 작은 행동 1개를 오늘 바로 실행하세요.",
                90,
                140);
    }
}
