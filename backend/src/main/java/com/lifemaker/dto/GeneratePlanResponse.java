package com.lifemaker.dto;

import java.util.List;

public record GeneratePlanResponse(
    AnalysisSummary analysis,
    List<QuestResponse> quests
) {
    public record AnalysisSummary(
        String stage,
        String focusArea,
        String reasoning,
        String caution,
        String suggestedRoutine
    ) {
    }
}
