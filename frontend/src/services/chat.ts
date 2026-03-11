import { ChatMessage } from "../types";

type StompLikeClient = {
  debug: (message: string) => void;
  connect: (headers: Record<string, string>, onConnect: () => void, onError: (error: unknown) => void) => void;
  subscribe: (destination: string, callback: (payload: { body: string }) => void) => void;
  send: (destination: string, headers: Record<string, string>, body: string) => void;
  disconnect: (callback?: () => void) => void;
};

export type ChatConnection = {
  disconnect: () => void;
  send: (message: ChatMessage) => void;
};

export const connectChat = async (roomId: string, onMessage: (message: ChatMessage) => void): Promise<ChatConnection> => {
  (globalThis as { global?: typeof globalThis }).global = globalThis;

  const [{ default: SockJS }, stompModule] = await Promise.all([import("sockjs-client"), import("stompjs")]);
  const stompFactory =
    "Stomp" in stompModule
      ? (stompModule.Stomp as { over: (socket: unknown) => StompLikeClient })
      : ((stompModule as { default?: { Stomp?: { over: (socket: unknown) => StompLikeClient } } }).default?.Stomp as {
          over: (socket: unknown) => StompLikeClient;
        });

  if (!stompFactory?.over) {
    throw new Error("채팅 클라이언트를 불러오지 못했습니다.");
  }

  const socket = new SockJS(`${import.meta.env.VITE_WS_URL ?? "http://localhost:8080"}/ws-chat`);
  const client = stompFactory.over(socket);
  client.debug = () => {};

  return await new Promise<ChatConnection>((resolve, reject) => {
    try {
      client.connect(
        {},
        () => {
          client.subscribe(`/topic/chat/${roomId}`, (payload) => {
            onMessage(JSON.parse(payload.body) as ChatMessage);
          });

          resolve({
            disconnect: () => client.disconnect(() => undefined),
            send: (message) => client.send("/app/chat.send", {}, JSON.stringify(message))
          });
        },
        (error) => {
          reject(error);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
