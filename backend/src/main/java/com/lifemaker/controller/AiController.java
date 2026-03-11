package com.lifemaker.controller;

import com.lifemaker.dto.GeneratePlanRequest;
import com.lifemaker.dto.GeneratePlanResponse;
import com.lifemaker.model.User;
import com.lifemaker.service.AiPlanningService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiPlanningService aiPlanningService;

    public AiController(AiPlanningService aiPlanningService) {
        this.aiPlanningService = aiPlanningService;
    }

    @PostMapping("/generate-plan")
    public ResponseEntity<GeneratePlanResponse> generatePlan(@AuthenticationPrincipal User user,
                                                             @Valid @RequestBody GeneratePlanRequest request) {
        return ResponseEntity.ok(aiPlanningService.generatePlan(user, request));
    }
}
