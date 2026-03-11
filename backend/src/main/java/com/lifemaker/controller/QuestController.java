package com.lifemaker.controller;

import com.lifemaker.dto.QuestCreateRequest;
import com.lifemaker.model.Quest;
import com.lifemaker.model.User;
import com.lifemaker.service.QuestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quests")
public class QuestController {
    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    @GetMapping
    public ResponseEntity<List<Quest>> list(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(questService.getUserQuests(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Quest> create(Authentication authentication, @Valid @RequestBody QuestCreateRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(questService.createQuest(user.getId(), request));
    }

    @PostMapping("/{questId}/complete")
    public ResponseEntity<Quest> complete(Authentication authentication, @PathVariable String questId) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(questService.completeQuest(user.getId(), questId));
    }
}
