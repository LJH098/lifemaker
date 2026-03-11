export type UserStats = {
  focus: number;
  knowledge: number;
  health: number;
  social: number;
  discipline: number;
};

export type Avatar = {
  hair: string;
  clothes: string;
  accessories: string[];
  colors: {
    skin: string;
    hair: string;
    clothes: string;
  };
};

export type User = {
  id: string;
  email: string;
  nickname: string;
  level: number;
  exp: number;
  coins: number;
  ownedItemIds: string[];
  avatar: Avatar;
  stats: UserStats;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  rewardExp: number;
  rewardCoin: number;
  status: "in_progress" | "completed" | "in-progress";
  progress: number;
  category: string;
  difficulty: string;
};

export type ShopItem = {
  itemId: string;
  name: string;
  type: string;
  price: number;
  image: string;
};

export type ChatMessage = {
  senderNickname: string;
  content: string;
  roomId: string;
  sentAt: string;
};

export type PlazaDirection = "up" | "down" | "left" | "right";

export type PlazaParticipant = {
  userId: string;
  nickname: string;
  level: number;
  avatar: Avatar;
  x: number;
  y: number;
  direction: PlazaDirection;
  moving: boolean;
};

export type PlazaJoinCommand = {
  plazaId: string;
};

export type PlazaMoveCommand = {
  plazaId: string;
  x: number;
  y: number;
  direction: PlazaDirection;
  moving: boolean;
  seq: number;
};

export type PlazaChatCommand = {
  plazaId: string;
  content: string;
};

export type PlazaSnapshot = {
  plazaId: string;
  participants: PlazaParticipant[];
};

export type PlazaEvent = {
  type: "joined" | "moved" | "chatted" | "left";
  plazaId: string;
  participant: PlazaParticipant | null;
  userId: string | null;
  content: string | null;
  sentAt: string | null;
  seq: number | null;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type GeneratePlanPayload = {
  source: "ai" | "fallback";
  sourceReason?: string | null;
  analysis: {
    stage: string;
    focusArea: string;
    reasoning: string;
    caution: string;
    suggestedRoutine: string;
  };
  quests: Quest[];
};

export type CompleteQuestPayload = {
  quest: Quest;
  user: User;
  leveledUp: boolean;
  earnedExp: number;
  earnedCoins: number;
};

export type PurchaseItemPayload = {
  itemId: string;
  user: User;
};
