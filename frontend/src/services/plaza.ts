import type { PlazaChatCommand, PlazaEvent, PlazaJoinCommand, PlazaMoveCommand, PlazaSnapshot } from "../types";

type StompLikeClient = {
  debug: (message: string) => void;
  connect: (headers: Record<string, string>, onConnect: () => void, onError: (error: unknown) => void) => void;
  subscribe: (destination: string, callback: (payload: { body: string }) => void) => void;
  send: (destination: string, headers: Record<string, string>, body: string) => void;
  disconnect: (callback?: () => void) => void;
};

export type PlazaConnection = {
  disconnect: () => void;
  join: (command: PlazaJoinCommand) => void;
  move: (command: PlazaMoveCommand) => void;
  chat: (command: PlazaChatCommand) => void;
};

type ConnectPlazaOptions = {
  token: string;
  onSnapshot: (snapshot: PlazaSnapshot) => void;
  onEvent: (event: PlazaEvent) => void;
  onDisconnect: (reason: string) => void;
};

export async function connectPlaza(options: ConnectPlazaOptions): Promise<PlazaConnection> {
  (globalThis as { global?: typeof globalThis }).global = globalThis;

  const [{ default: SockJS }, stompModule] = await Promise.all([import("sockjs-client"), import("stompjs")]);
  const stompFactory =
    "Stomp" in stompModule
      ? (stompModule.Stomp as { over: (socket: unknown) => StompLikeClient })
      : ((stompModule as { default?: { Stomp?: { over: (socket: unknown) => StompLikeClient } } }).default?.Stomp as {
          over: (socket: unknown) => StompLikeClient;
        });

  if (!stompFactory?.over) {
    throw new Error("Failed to load the plaza realtime client.");
  }

  const socket = new SockJS(`${import.meta.env.VITE_WS_URL ?? "http://localhost:8080"}/ws-chat`);
  const client = stompFactory.over(socket);
  client.debug = () => {};

  let disconnectedManually = false;
  let settled = false;

  return await new Promise<PlazaConnection>((resolve, reject) => {
    const notifyDisconnect = (reason: string) => {
      if (!disconnectedManually && settled) {
        options.onDisconnect(reason);
      }
    };

    (socket as { onclose?: () => void }).onclose = () => notifyDisconnect("The plaza connection closed.");
    (socket as { onerror?: () => void }).onerror = () => notifyDisconnect("The plaza connection encountered an error.");

    try {
      client.connect(
        { Authorization: `Bearer ${options.token}` },
        () => {
          settled = true;
          client.subscribe("/user/queue/plaza.init", (payload) => {
            options.onSnapshot(JSON.parse(payload.body) as PlazaSnapshot);
          });
          client.subscribe("/topic/plaza.events", (payload) => {
            options.onEvent(JSON.parse(payload.body) as PlazaEvent);
          });

          resolve({
            disconnect: () => {
              disconnectedManually = true;
              client.disconnect(() => undefined);
            },
            join: (command) => client.send("/app/plaza.join", {}, JSON.stringify(command)),
            move: (command) => client.send("/app/plaza.move", {}, JSON.stringify(command)),
            chat: (command) => client.send("/app/plaza.chat", {}, JSON.stringify(command))
          });
        },
        (error) => {
          const message = normalizeRealtimeError(error);
          if (!settled) {
            reject(new Error(message));
            return;
          }
          notifyDisconnect(message);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

function normalizeRealtimeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Failed to connect to the plaza server.";
}

