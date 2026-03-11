package com.lifemaker.controller;

import com.lifemaker.dto.CompleteQuestResponse;
import com.lifemaker.dto.QuestResponse;
import com.lifemaker.model.User;
import com.lifemaker.service.QuestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
public class QuestController {

    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    @GetMapping
    public ResponseEntity<List<QuestResponse>> quests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(questService.getQuests(user.getId()).stream()
            .map(QuestResponse::from)
            .toList());
    }

    @PostMapping("/{questId}/complete")
    public ResponseEntity<CompleteQuestResponse> complete(@AuthenticationPrincipal User user,
                                                          @PathVariable String questId) {
        return ResponseEntity.ok(questService.completeQuest(user.getId(), questId));
    }
}
