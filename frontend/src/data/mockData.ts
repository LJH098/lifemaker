import { ChatMessage, Quest, ShopItem, User } from "../types";

export const mockUser: User = {
  id: "u-1",
  email: "hero@lifemaker.gg",
  nickname: "QuestRunner",
  level: 7,
  exp: 640,
  coins: 1280,
  ownedItemIds: ["i-4"],
  avatar: {
    hair: "Cyber Cut",
    clothes: "Explorer Jacket",
    accessories: ["Green Visor", "Focus Charm"],
    colors: {
      skin: "#F1C27D",
      hair: "#22C55E",
      clothes: "#38BDF8"
    }
  },
  stats: {
    focus: 72,
    knowledge: 64,
    health: 51,
    social: 38,
    discipline: 69
  }
};

export const mockQuests: Quest[] = [
  {
    id: "q-1",
    title: "알고리즘 1문제 정복",
    description: "백준 또는 LeetCode에서 오늘의 문제 1개를 해결해 보세요.",
    rewardExp: 80,
    rewardCoin: 120,
    status: "in-progress",
    progress: 65,
    category: "학습",
    difficulty: "보통"
  },
  {
    id: "q-2",
    title: "2시간 집중 코딩",
    description: "방해 요소를 끄고 뽀모도로 4세션을 완료해 보세요.",
    rewardExp: 120,
    rewardCoin: 180,
    status: "in-progress",
    progress: 40,
    category: "실행",
    difficulty: "어려움"
  },
  {
    id: "q-3",
    title: "개발 강의 복습",
    description: "React 또는 Spring Boot 강의를 30분 보고 핵심 3줄을 요약해 보세요.",
    rewardExp: 60,
    rewardCoin: 90,
    status: "completed",
    progress: 100,
    category: "학습",
    difficulty: "쉬움"
  }
];

export const mockItems: ShopItem[] = [
  { itemId: "i-1", name: "Pixel Blade Hair", type: "hair", price: 280, image: "PX" },
  { itemId: "i-2", name: "Guild Hoodie", type: "clothes", price: 420, image: "HD" },
  { itemId: "i-3", name: "Focus Lamp", type: "room_furniture", price: 360, image: "LP" },
  { itemId: "i-4", name: "Legend Pin", type: "accessories", price: 150, image: "PN" }
];

export const mockChat: ChatMessage[] = [
  {
    senderNickname: "System",
    content: "광장 채팅에 연결되었습니다. 오늘의 목표를 가볍게 공유해 보세요.",
    roomId: "plaza",
    sentAt: "Now"
  }
];
