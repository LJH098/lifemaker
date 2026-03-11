package com.lifemaker.service;

import com.lifemaker.dto.QuestCreateRequest;
import com.lifemaker.model.Quest;
import com.lifemaker.model.User;
import com.lifemaker.repository.QuestRepository;
import com.lifemaker.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class QuestService {
    private final QuestRepository questRepository;
    private final UserRepository userRepository;

    public QuestService(QuestRepository questRepository, UserRepository userRepository) {
        this.questRepository = questRepository;
        this.userRepository = userRepository;
    }

    public List<Quest> getUserQuests(String userId) {
        List<Quest> quests = questRepository.findByUserId(userId);
        if (quests.isEmpty()) {
            questRepository.saveAll(List.of(
                    seedQuest(userId, "알고리즘 1문제 정복", "백준 또는 LeetCode에서 오늘의 핵심 문제 1개를 해결하세요.", 80, 120, 65),
                    seedQuest(userId, "2시간 집중 코딩", "방해 요소를 끄고 포모도로 4세션을 완료하세요.", 120, 180, 40),
                    seedQuest(userId, "개발 강의 복습", "강의 30분을 보고 핵심 3줄 요약을 남기세요.", 60, 90, 100)));
            quests = questRepository.findByUserId(userId);
        }
        return quests;
    }

    public Quest createQuest(String userId, QuestCreateRequest request) {
        Quest quest = new Quest();
        quest.setUserId(userId);
        quest.setTitle(request.getTitle());
        quest.setDescription(request.getDescription());
        quest.setRewardExp(request.getRewardExp());
        quest.setRewardCoin(request.getRewardCoin());
        quest.setStatus("in-progress");
        quest.setProgress(0);
        return questRepository.save(quest);
    }

    public Quest completeQuest(String userId, String questId) {
        Quest quest = questRepository.findById(questId).orElseThrow();
        if (!quest.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not your quest");
        }
        quest.setStatus("completed");
        quest.setProgress(100);
        questRepository.save(quest);

        User user = userRepository.findById(userId).orElseThrow();
        int updatedExp = user.getExp() + quest.getRewardExp();
        user.setCoins(user.getCoins() + quest.getRewardCoin());
        user.setLevel((updatedExp / 300) + 1);
        user.setExp(updatedExp);
        userRepository.save(user);
        return quest;
    }

    private Quest seedQuest(String userId, String title, String description, int rewardExp, int rewardCoin, int progress) {
        Quest quest = new Quest();
        quest.setUserId(userId);
        quest.setTitle(title);
        quest.setDescription(description);
        quest.setRewardExp(rewardExp);
        quest.setRewardCoin(rewardCoin);
        quest.setStatus(progress == 100 ? "completed" : "in-progress");
        quest.setProgress(progress);
        return quest;
    }
}
