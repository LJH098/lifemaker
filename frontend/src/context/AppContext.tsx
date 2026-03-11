import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, extractApiError } from "../services/api";
import { AuthPayload, CompleteQuestPayload, GeneratePlanPayload, PurchaseItemPayload, Quest, ShopItem, User } from "../types";

type SignupInput = {
  nickname: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AvatarInput = {
  hair: string;
  clothes: string;
  accessories: string[];
  skinColor: string;
  hairColor: string;
  clothesColor: string;
};

type AppContextValue = {
  user: User | null;
  quests: Quest[];
  shopItems: ShopItem[];
  isAuthenticated: boolean;
  loadingSession: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateAvatar: (input: AvatarInput) => Promise<User>;
  generatePlan: (goal: string, currentSituation: string) => Promise<GeneratePlanPayload>;
  completeQuest: (questId: string) => Promise<CompleteQuestPayload>;
  loadShopItems: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<PurchaseItemPayload>;
};

const AppContext = createContext<AppContextValue | null>(null);
const TOKEN_KEY = "lifemaker-token";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    void hydrateSession();
  }, []);

  const hydrateSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoadingSession(false);
      return;
    }

    try {
      const [userResponse, questsResponse, shopItemsResponse] = await Promise.all([
        api.get<User>("/users/me"),
        api.get<Quest[]>("/quests"),
        api.get<ShopItem[]>("/shop/items")
      ]);
      setUser(userResponse.data);
      setQuests(normalizeQuests(questsResponse.data));
      setShopItems(shopItemsResponse.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setQuests([]);
      setShopItems([]);
    } finally {
      setLoadingSession(false);
    }
  };

  const applyAuthPayload = (payload: AuthPayload) => {
    localStorage.setItem(TOKEN_KEY, payload.token);
    setUser(payload.user);
  };

  const login = async (input: LoginInput) => {
    const response = await api.post<AuthPayload>("/auth/login", input);
    applyAuthPayload(response.data);
    await refreshSession();
  };

  const signup = async (input: SignupInput) => {
    const response = await api.post<AuthPayload>("/auth/signup", input);
    applyAuthPayload(response.data);
    await refreshSession();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setQuests([]);
    setShopItems([]);
  };

  const refreshSession = async () => {
    const [userResponse, questsResponse, shopItemsResponse] = await Promise.all([
      api.get<User>("/users/me"),
      api.get<Quest[]>("/quests"),
      api.get<ShopItem[]>("/shop/items")
    ]);
    setUser(userResponse.data);
    setQuests(normalizeQuests(questsResponse.data));
    setShopItems(shopItemsResponse.data);
  };

  const updateAvatar = async (input: AvatarInput) => {
    try {
      const response = await api.put<User>("/users/avatar", input);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const generatePlan = async (goal: string, currentSituation: string) => {
    try {
      const response = await api.post<GeneratePlanPayload>("/ai/generate-plan", { goal, currentSituation });
      setQuests((prev) => normalizeQuests([...response.data.quests, ...prev]));
      return {
        ...response.data,
        quests: normalizeQuests(response.data.quests)
      };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      const response = await api.post<CompleteQuestPayload>(`/quests/${questId}/complete`);
      setUser(response.data.user);
      setQuests((prev) =>
        normalizeQuests(prev.map((quest) => (quest.id === questId ? normalizeQuest(response.data.quest) : normalizeQuest(quest))))
      );
      return {
        ...response.data,
        quest: normalizeQuest(response.data.quest)
      };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const loadShopItems = async () => {
    try {
      const response = await api.get<ShopItem[]>("/shop/items");
      setShopItems(response.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  const purchaseItem = async (itemId: string) => {
    try {
      const response = await api.post<PurchaseItemPayload>(`/shop/purchase/${itemId}`);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        quests,
        shopItems,
        isAuthenticated: !!user,
        loadingSession,
        login,
        signup,
        logout,
        refreshSession,
        updateAvatar,
        generatePlan,
        completeQuest,
        loadShopItems,
        purchaseItem
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

function normalizeQuests(quests: Quest[]) {
  return [...quests].map(normalizeQuest).sort((left, right) => {
    if (left.status === right.status) {
      return left.title.localeCompare(right.title);
    }
    return left.status === "completed" ? 1 : -1;
  });
}

function normalizeQuest(quest: Quest): Quest {
  return {
    ...quest,
    status: quest.status === "in-progress" ? "in_progress" : quest.status
  };
}
