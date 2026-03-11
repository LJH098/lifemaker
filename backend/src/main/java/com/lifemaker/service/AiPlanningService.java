package com.lifemaker.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifemaker.dto.GeneratePlanRequest;
import com.lifemaker.dto.GeneratePlanResponse;
import com.lifemaker.dto.QuestResponse;
import com.lifemaker.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Service
public class AiPlanningService {

    private final QuestService questService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String openAiApiKey;
    private final String openAiModel;

    public AiPlanningService(QuestService questService,
                             ObjectMapper objectMapper,
                             @Value("${OPENAI_API_KEY:}") String openAiApiKey,
                             @Value("${OPENAI_MODEL:gpt-4o-mini}") String openAiModel) {
        this.questService = questService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.openAiApiKey = openAiApiKey == null ? "" : openAiApiKey.trim();
        this.openAiModel = openAiModel;
    }

    public GeneratePlanResponse generatePlan(User user, GeneratePlanRequest request) {
        PlanResult result = openAiApiKey.isBlank() ? buildFallbackResult(request, "openai_key_missing") : buildAiDraft(request);
        PlanDraft draft = result.draft();

        List<QuestService.QuestBlueprint> blueprints = draft.quests().stream()
            .map(quest -> new QuestService.QuestBlueprint(
                quest.title(),
                quest.description(),
                quest.rewardExp(),
                quest.rewardCoin(),
                quest.category(),
                quest.difficulty()
            ))
            .toList();

        List<QuestResponse> quests = questService.createQuests(user.getId(), blueprints).stream()
            .map(QuestResponse::from)
            .toList();

        return new GeneratePlanResponse(
            result.source(),
            result.sourceReason(),
            new GeneratePlanResponse.AnalysisSummary(
                draft.stage(),
                draft.focusArea(),
                draft.reasoning(),
                draft.caution(),
                draft.suggestedRoutine()
            ),
            quests
        );
    }

    private PlanResult buildAiDraft(GeneratePlanRequest request) {
        try {
            String prompt = """
                You are an RPG-style life coach inside a gamified productivity app.
                Analyze the user's life goal and current situation.
                Return valid JSON only, with all natural-language values written in Korean.

                Rules:
                - stage must be one of: 탐색, 준비, 실행, 회복
                - create exactly 3 quests
                - quests must feel realistic for today or this week
                - rewardExp must be between 60 and 140
                - rewardCoin must be between 80 and 220
                - category must be one of: 실행, 학습, 건강, 관계, 커리어
                - difficulty must be one of: 쉬움, 보통, 어려움
                - keep each description concise and actionable

                User goal:
                %s

                Current situation:
                %s

                JSON schema:
                {
                  "stage": "탐색",
                  "focusArea": "string",
                  "reasoning": "string",
                  "caution": "string",
                  "suggestedRoutine": "string",
                  "quests": [
                    {
                      "title": "string",
                      "description": "string",
                      "rewardExp": 80,
                      "rewardCoin": 120,
                      "category": "학습",
                      "difficulty": "보통"
                    }
                  ]
                }
                """.formatted(request.goal(), request.currentSituation());

            String body = objectMapper.writeValueAsString(new OpenAiChatRequest(
                openAiModel,
                List.of(
                    new OpenAiMessage("system", "Return valid JSON only."),
                    new OpenAiMessage("user", prompt)
                ),
                new ResponseFormat("json_object")
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 400) {
                return buildFallbackResult(request, extractOpenAiErrorReason(response.body(), response.statusCode()));
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choiceNode = root.path("choices").path(0).path("message").path("content");
            if (choiceNode.isMissingNode() || choiceNode.asText().isBlank()) {
                return buildFallbackResult(request, "openai_empty_response");
            }

            PlanDraft draft = objectMapper.readValue(choiceNode.asText(), PlanDraft.class);
            if (!isValidDraft(draft)) {
                return buildFallbackResult(request, "openai_parse_error");
            }

            return new PlanResult("ai", null, draft);
        } catch (Exception ignored) {
            return buildFallbackResult(request, "openai_request_failed");
        }
    }

    private PlanResult buildFallbackResult(GeneratePlanRequest request, String reason) {
        return new PlanResult("fallback", reason, buildFallbackDraft(request));
    }

    private String extractOpenAiErrorReason(String responseBody, int statusCode) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String code = root.path("error").path("code").asText("");
            if (!code.isBlank()) {
                return code;
            }
            String type = root.path("error").path("type").asText("");
            if (!type.isBlank()) {
                return type;
            }
        } catch (Exception ignored) {
            // Keep generic HTTP reason below.
        }
        return "openai_http_" + statusCode;
    }

    private boolean isValidDraft(PlanDraft draft) {
        if (draft == null || draft.quests() == null || draft.quests().size() != 3) {
            return false;
        }
        return draft.stage() != null
            && draft.focusArea() != null
            && draft.reasoning() != null
            && draft.caution() != null
            && draft.suggestedRoutine() != null;
    }

    private PlanDraft buildFallbackDraft(GeneratePlanRequest request) {
        String normalized = (request.goal() + " " + request.currentSituation()).toLowerCase(Locale.ROOT);

        if (containsAny(normalized, "취업", "이직", "포트폴리오", "면접", "이력서", "자소서")) {
            return new PlanDraft(
                "준비",
                "취업 준비를 잘게 쪼개고 매일 제출 가능한 결과물을 만들기",
                "지금은 방향성보다 이력서, 포트폴리오, 지원 루틴처럼 반복 가능한 준비 흐름을 만드는 단계입니다.",
                "한 번에 너무 많은 준비 항목을 잡으면 금방 지치기 쉽습니다.",
                "하루 1개의 메인 퀘스트와 1개의 보조 퀘스트만 완료하는 리듬으로 시작해 보세요.",
                List.of(
                    new PlanQuest("지원 공고 5개 분석", "원하는 직무 공고 5개를 보고 공통 요구사항 3가지를 정리하세요.", 80, 110, "커리어", "쉬움"),
                    new PlanQuest("포트폴리오 1섹션 개선", "프로젝트 하나를 골라 문제, 해결, 결과를 더 명확하게 정리하세요.", 110, 170, "실행", "보통"),
                    new PlanQuest("코딩 문제 2개 도전", "기초 알고리즘 문제 2개를 풀고 풀이 이유를 기록하세요.", 120, 180, "학습", "보통")
                )
            );
        }

        if (containsAny(normalized, "개발", "프론트", "백엔드", "알고리즘", "코딩", "공부")) {
            return new PlanDraft(
                "실행",
                "학습을 바로 결과물과 연결되는 퀘스트로 바꾸기",
                "목표가 비교적 분명하니 작은 학습과 반복 퀘스트가 가장 효과적입니다.",
                "긴 계획보다 오늘 끝낼 수 있는 작업 단위로 줄이는 것이 중요합니다.",
                "25분 집중 2세트를 기본 단위로 두고, 끝날 때마다 배운 점을 짧게 기록해 보세요.",
                List.of(
                    new PlanQuest("알고리즘 1문제 해결", "오늘의 알고리즘 문제 1개를 끝까지 풀어보세요.", 80, 120, "학습", "보통"),
                    new PlanQuest("포트폴리오 기능 1개 구현", "프로젝트에서 가장 작은 UI 또는 API 기능 1개를 실제로 추가하세요.", 120, 180, "실행", "보통"),
                    new PlanQuest("강의 30분 + 요약", "강의나 문서를 30분 보고 핵심 내용 5줄을 요약하세요.", 70, 90, "학습", "쉬움")
                )
            );
        }

        if (containsAny(normalized, "불안", "번아웃", "지침", "우울", "회복", "생활")) {
            return new PlanDraft(
                "회복",
                "에너지 회복과 루틴 복구를 먼저 만드는 단계",
                "지금은 성과보다 일상을 다시 안정시키는 것이 더 중요합니다.",
                "처음부터 완벽한 루틴을 만들려고 하면 다시 중단될 가능성이 높습니다.",
                "하루 20~40분 안에 끝나는 퀘스트 위주로 구성하고, 성공 경험을 빠르게 쌓아 보세요.",
                List.of(
                    new PlanQuest("기상 후 20분 회복 루틴", "물 마시기, 창문 열기, 오늘의 할 일 1개 적기를 완료하세요.", 70, 90, "건강", "쉬움"),
                    new PlanQuest("미루던 일 1개 시작", "가장 미루던 일 하나를 골라 15분만 시작해 보세요.", 100, 140, "실행", "보통"),
                    new PlanQuest("산책 또는 스트레칭 15분", "몸을 움직이며 머리를 비우는 시간을 가져보세요.", 80, 100, "건강", "쉬움")
                )
            );
        }

        return new PlanDraft(
            "탐색",
            "방향을 좁히고 첫 실행 신호를 만드는 단계",
            "아직 선택지가 넓기 때문에 비교 가능한 정보와 작은 실행 경험이 함께 필요합니다.",
            "탐색만 길어지면 시작 시점이 계속 늦어질 수 있습니다.",
            "하루에 정보 수집 1개와 작은 실행 1개를 짝지어 루틴으로 만들어 보세요.",
            List.of(
                new PlanQuest("관심 분야 3개 비교", "관심 있는 선택지 3개를 적고 끌리는 이유를 정리하세요.", 70, 90, "커리어", "쉬움"),
                new PlanQuest("관련 정보 1개 수집", "공고, 인터뷰, 강의 중 하나를 보고 핵심 인사이트 5줄을 기록하세요.", 90, 120, "학습", "쉬움"),
                new PlanQuest("작은 체험 퀘스트 실행", "오늘 안에 끝낼 수 있는 작은 연습이나 행동 1개를 완료하세요.", 110, 160, "실행", "보통")
            )
        );
    }

    private boolean containsAny(String source, String... keywords) {
        for (String keyword : keywords) {
            if (source.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlanDraft(
        String stage,
        String focusArea,
        String reasoning,
        String caution,
        String suggestedRoutine,
        List<PlanQuest> quests
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlanQuest(
        String title,
        String description,
        int rewardExp,
        int rewardCoin,
        String category,
        String difficulty
    ) {
    }

    private record PlanResult(
        String source,
        String sourceReason,
        PlanDraft draft
    ) {
    }

    private record OpenAiChatRequest(
        String model,
        List<OpenAiMessage> messages,
        ResponseFormat response_format
    ) {
    }

    private record OpenAiMessage(
        String role,
        String content
    ) {
    }

    private record ResponseFormat(
        String type
    ) {
    }
}
