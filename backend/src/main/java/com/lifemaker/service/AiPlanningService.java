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
import java.util.ArrayList;
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
        PlanDraft draft = openAiApiKey.isBlank()
            ? buildFallbackDraft(request)
            : buildAiDraft(request);

        List<QuestService.QuestBlueprint> blueprints = draft.quests().stream()
            .map(quest -> new QuestService.QuestBlueprint(
                quest.title(),
                quest.description(),
                quest.rewardExp(),
                quest.rewardCoin(),
                quest.category(),
                quest.difficulty()))
            .toList();

        List<QuestResponse> quests = questService.createQuests(user.getId(), blueprints).stream()
            .map(QuestResponse::from)
            .toList();

        return new GeneratePlanResponse(
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

    private PlanDraft buildAiDraft(GeneratePlanRequest request) {
        try {
            String prompt = """
                너는 한국어로 답하는 목표 달성 코치다.
                사용자의 목표와 상황을 분석해 반드시 JSON만 출력해라.
                stage는 회복, 탐색, 준비, 실행 중 하나여야 한다.
                quests는 3개 생성하고, 각 퀘스트는 현실에서 오늘 또는 이번 주에 실행 가능한 수준으로 구체적이어야 한다.
                rewardExp는 60~140, rewardCoin은 80~220 범위로 작성해라.
                difficulty는 쉬움, 보통, 어려움 중 하나다.
                category는 실행, 학습, 건강, 관계, 커리어 중 하나다.

                사용자 목표:
                %s

                사용자 현재 상황:
                %s

                JSON 형식:
                {
                  "stage": "회복|탐색|준비|실행",
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
                      "category": "실행|학습|건강|관계|커리어",
                      "difficulty": "쉬움|보통|어려움"
                    }
                  ]
                }
                """.formatted(request.goal(), request.currentSituation());

            String body = objectMapper.writeValueAsString(new OpenAiChatRequest(
                openAiModel,
                List.of(
                    new OpenAiMessage("system", "당신은 JSON만 출력하는 서비스 분석기다."),
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
                return buildFallbackDraft(request);
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            PlanDraft draft = objectMapper.readValue(content, PlanDraft.class);
            if (draft.quests() == null || draft.quests().size() != 3) {
                return buildFallbackDraft(request);
            }
            return draft;
        } catch (Exception ignored) {
            return buildFallbackDraft(request);
        }
    }

    private PlanDraft buildFallbackDraft(GeneratePlanRequest request) {
        String goal = request.goal().trim();
        String situation = request.currentSituation().trim();
        String normalized = (goal + " " + situation).toLowerCase(Locale.ROOT);

        String stage;
        String focusArea;
        String reasoning;
        String caution;
        String routine;
        List<PlanQuest> quests = new ArrayList<>();

        if (containsAny(normalized, "번아웃", "무기력", "불안", "지쳤", "잠", "생활")) {
            stage = "회복";
            focusArea = "에너지를 회복하고 실행 저항을 낮추는 루틴 설계";
            reasoning = "현재는 큰 목표를 밀어붙이기보다 생활 리듬과 심리적 마찰을 줄이는 것이 우선입니다.";
            caution = "처음부터 고난도 목표를 넣으면 다시 중단될 가능성이 높습니다.";
            routine = "하루 20~40분, 같은 시간대에 1개 퀘스트만 처리하는 구조가 적합합니다.";
            quests.add(new PlanQuest("기상 후 20분 리셋 루틴", "기상 후 물 마시기, 창문 열기, 오늘 할 일 1개 적기를 완료하세요.", 70, 90, "건강", "쉬움"));
            quests.add(new PlanQuest("목표 재정의 메모 10줄", "지금 목표를 왜 이루고 싶은지와 막히는 이유를 10줄 이내로 정리하세요.", 80, 100, "실행", "쉬움"));
            quests.add(new PlanQuest("짧은 실전 행동 1개", "지원서 초안 작성, 강의 15분 듣기, 공고 3개 저장 중 하나를 선택해 끝내세요.", 100, 140, "커리어", "보통"));
        } else if (containsAny(normalized, "취업", "이직", "포트폴리오", "면접", "이력서", "자소서")) {
            stage = "준비";
            focusArea = "취업 준비를 작은 제출 단위로 쪼개는 실행 구조";
            reasoning = "목표는 비교적 명확하므로 실행 단위를 줄이고 피드백 주기를 짧게 만드는 것이 핵심입니다.";
            caution = "한 번에 이력서, 포트폴리오, 코테를 모두 잡으면 유지가 어렵습니다.";
            routine = "평일 기준 하루 1개 핵심 퀘스트와 1개 보조 퀘스트로 운영하세요.";
            quests.add(new PlanQuest("지원 포지션 5개 수집", "원하는 직무 기준으로 공고 5개를 저장하고 공통 요구사항을 3가지 적으세요.", 80, 110, "커리어", "쉬움"));
            quests.add(new PlanQuest("이력서 한 섹션 개선", "프로젝트 또는 경험 섹션 한 부분만 선택해 성과 중심 문장으로 수정하세요.", 110, 170, "실행", "보통"));
            quests.add(new PlanQuest("실전 역량 30분 훈련", "코딩 테스트 1문제 또는 포트폴리오 1블록 개선을 30분 동안 진행하세요.", 120, 180, "학습", "보통"));
        } else if (containsAny(normalized, "공부", "자격증", "시험", "개발", "학습")) {
            stage = "실행";
            focusArea = "학습을 결과물 중심 퀘스트로 전환";
            reasoning = "이미 목표가 구체적이므로 누적 가능한 산출물을 만드는 편이 동기 유지에 유리합니다.";
            caution = "오래 앉아 있는 계획보다 완료 기준이 명확한 작은 출력물이 필요합니다.";
            routine = "25분 집중 + 5분 기록을 하루 2세트 정도로 시작하세요.";
            quests.add(new PlanQuest("핵심 개념 1개 요약", "오늘 공부할 개념 하나를 선택해 5문장으로 요약하세요.", 70, 90, "학습", "쉬움"));
            quests.add(new PlanQuest("실전 문제 1개 해결", "문제 1개를 풀고 오답 원인 또는 배운 점을 3줄로 남기세요.", 100, 150, "실행", "보통"));
            quests.add(new PlanQuest("복습 카드 5장 만들기", "다음 복습에 쓸 질문 카드 또는 체크리스트 5개를 만드세요.", 90, 120, "학습", "쉬움"));
        } else {
            stage = "탐색";
            focusArea = "방향 탐색과 실행 후보를 빠르게 좁히기";
            reasoning = "목표가 아직 넓기 때문에 정보를 더 모으기보다 선택지를 비교 가능한 형태로 줄이는 것이 중요합니다.";
            caution = "탐색 단계가 길어지면 실행 시점을 계속 미루게 됩니다.";
            routine = "하루 하나씩 비교 가능한 정보나 경험을 쌓는 구조가 적합합니다.";
            quests.add(new PlanQuest("관심 분야 3개 비교", "관심 있는 분야 3개를 적고, 각각 끌리는 이유와 걱정을 한 줄씩 정리하세요.", 70, 90, "커리어", "쉬움"));
            quests.add(new PlanQuest("현실 정보 1개 수집", "관심 직무의 공고, 인터뷰, 커리큘럼 중 하나를 보고 메모 5줄을 남기세요.", 90, 120, "학습", "쉬움"));
            quests.add(new PlanQuest("작은 체험 퀘스트 실행", "관심 분야와 연결되는 미니 실습 또는 지원 행동 1개를 오늘 안에 끝내세요.", 110, 160, "실행", "보통"));
        }

        return new PlanDraft(stage, focusArea, reasoning, caution, routine, quests);
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
