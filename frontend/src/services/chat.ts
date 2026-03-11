import SockJS from "sockjs-client";
import Stomp from "stompjs";

export const connectChat = (
  roomId: string,
  onMessage: (message: { senderNickname: string; content: string; sentAt: string; roomId: string }) => void
) => {
  const socket = new SockJS(`${import.meta.env.VITE_WS_URL ?? "http://localhost:8080"}/ws-chat`);
  const client = Stomp.over(socket);
  client.connect({}, () => {
    client.subscribe(`/topic/chat/${roomId}`, (payload: { body: string }) => {
      onMessage(JSON.parse(payload.body));
    });
  });
  return client;
};
