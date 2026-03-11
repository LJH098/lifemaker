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
  avatar: Avatar;
  stats: UserStats;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  rewardExp: number;
  rewardCoin: number;
  status: "in-progress" | "completed";
  progress: number;
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
