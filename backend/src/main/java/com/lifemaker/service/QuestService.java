package com.lifemaker.service;

import com.lifemaker.dto.CompleteQuestResponse;
import com.lifemaker.dto.QuestResponse;
import com.lifemaker.dto.UserResponse;
import com.lifemaker.model.Quest;
import com.lifemaker.model.QuestStatus;
import com.lifemaker.model.User;
import com.lifemaker.repository.QuestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class QuestService {

    private final UserService userService;
    private final QuestRepository questRepository;

    public QuestService(UserService userService, QuestRepository questRepository) {
        this.userService = userService;
        this.questRepository = questRepository;
    }

    public List<Quest> getQuests(String userId) {
        return questRepository.findByUserIdOrderByStatusAscTitleAsc(userId);
    }

    public List<Quest> createQuests(String userId, List<QuestBlueprint> blueprints) {
        List<Quest> quests = blueprints.stream()
            .map(blueprint -> new Quest(
                UUID.randomUUID().toString(),
                userId,
                blueprint.title(),
                blueprint.description(),
                blueprint.rewardExp(),
                blueprint.rewardCoin(),
                QuestStatus.IN_PROGRESS,
                0,
                blueprint.category(),
                blueprint.difficulty()
            ))
            .toList();
        return questRepository.saveAll(quests);
    }

    public CompleteQuestResponse completeQuest(String userId, String questId) {
        Quest quest = questRepository.findByIdAndUserId(questId, userId)
            .orElseThrow(() -> new IllegalArgumentException("퀘스트를 찾을 수 없습니다."));

        User currentUser = userService.findRequired(userId);
        int previousLevel = currentUser.getLevel();

        if (quest.getStatus() != QuestStatus.COMPLETED) {
            quest.setStatus(QuestStatus.COMPLETED);
            quest.setProgress(100);
            questRepository.save(quest);
            currentUser = userService.addRewards(userId, quest.getRewardExp(), quest.getRewardCoin());
            boostStats(currentUser, quest.getCategory());
            currentUser = userService.save(currentUser);
        }

        return new CompleteQuestResponse(
            QuestResponse.from(quest),
            UserResponse.from(currentUser),
            currentUser.getLevel() > previousLevel,
            quest.getRewardExp(),
            quest.getRewardCoin()
        );
    }

    private void boostStats(User user, String category) {
        switch (category) {
            case "건강" -> user.getStats().setHealth(Math.min(user.getStats().getHealth() + 4, 100));
            case "관계" -> user.getStats().setSocial(Math.min(user.getStats().getSocial() + 4, 100));
            case "실행" -> user.getStats().setDiscipline(Math.min(user.getStats().getDiscipline() + 5, 100));
            case "학습" -> user.getStats().setKnowledge(Math.min(user.getStats().getKnowledge() + 5, 100));
            default -> user.getStats().setFocus(Math.min(user.getStats().getFocus() + 4, 100));
        }
    }

    public record QuestBlueprint(
        String title,
        String description,
        int rewardExp,
        int rewardCoin,
        String category,
        String difficulty
    ) {
    }
}
