package com.lifemaker.controller;

import com.lifemaker.dto.AiQuestRequest;
import com.lifemaker.dto.AiQuestResponse;
import com.lifemaker.service.AiQuestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiQuestService aiQuestService;

    public AiController(AiQuestService aiQuestService) {
        this.aiQuestService = aiQuestService;
    }

    @PostMapping("/generateQuest")
    public ResponseEntity<AiQuestResponse> generateQuest(@Valid @RequestBody AiQuestRequest request) {
        return ResponseEntity.ok(aiQuestService.generateQuest(request));
    }
}
