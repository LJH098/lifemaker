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

export type RoomPlacement = {
  itemId: string;
  x: number;
  y: number;
  layer: number;
};

export type RoomGuestbookEntry = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export type RoomActivityEntry = {
  id: string;
  actor: string;
  message: string;
  createdAt: string;
};

export type RoomState = {
  title: string;
  isPublic: boolean;
  allowGuestbook: boolean;
  restMode: boolean;
  wallTheme: string;
  floorTheme: string;
  moodMessage: string;
  inviteCode: string;
  placements: RoomPlacement[];
  guestbookEntries: RoomGuestbookEntry[];
  activityEntries: RoomActivityEntry[];
};

export type User = {
  id: string;
  email: string;
  nickname: string;
  level: number;
  exp: number;
  coins: number;
  ownedItemIds: string[];
  room: RoomState;
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
  type?: "CHAT" | "PRESENCE" | "PRESENCE_SYNC" | "MOVE" | "LEAVE";
  senderId?: string;
  targetUserId?: string;
  senderNickname: string;
  content: string;
  roomId: string;
  sentAt: string;
  avatarX?: number;
  avatarY?: number;
  avatarPalette?: string;
  avatarHair?: string;
  avatarClothes?: string;
  avatarAccessories?: string[];
  avatarSkinColor?: string;
  avatarHairColor?: string;
  avatarClothesColor?: string;
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

export type RoomUpdatePayload = {
  title: string;
  isPublic: boolean;
  allowGuestbook: boolean;
  restMode: boolean;
  wallTheme: string;
  floorTheme: string;
  moodMessage: string;
  placements: RoomPlacement[];
};
