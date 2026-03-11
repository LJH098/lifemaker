import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import { mockChat } from "../data/mockData";
import { connectChat, type ChatConnection } from "../services/chat";
import { ChatMessage } from "../types";

export function PlazaPage() {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(mockChat);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const connectionRef = useRef<ChatConnection | null>(null);

  useEffect(() => {
    let cancelled = false;

    void connectChat("plaza", (message) => {
      setMessages((prev) => [...prev, message]);
      setConnected(true);
    })
      .then((connection) => {
        if (cancelled) {
          connection.disconnect();
          return;
        }
        connectionRef.current = connection;
        setError("");
        setConnected(true);
      })
      .catch((connectError) => {
        if (cancelled) {
          return;
        }
        setConnected(false);
        setError(connectError instanceof Error ? connectError.message : "채팅 서버에 연결하지 못했습니다.");
      });

    return () => {
      cancelled = true;
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      setConnected(false);
    };
  }, []);

  const handleSend = () => {
    if (!draft.trim() || !user || !connectionRef.current) {
      return;
    }

    connectionRef.current.send({
      senderNickname: user.nickname,
      content: draft.trim(),
      roomId: "plaza",
      sentAt: ""
    });
    setDraft("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center gap-3">
          <Users className="text-sky-400" />
          <h1 className="font-display text-2xl text-ink">Social Plaza</h1>
        </div>
        <p className="mt-3 text-slate-600">지금 접속 중인 플레이어를 보고 서로의 성장 상태를 가볍게 살펴보세요.</p>
        <div className="mt-4 rounded-2xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">
          채팅 상태: <span className={connected ? "text-accent" : "text-amber-700"}>{connected ? "실시간 연결됨" : "연결 중..."}</span>
        </div>
        {error && <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 grid gap-3">
          {["FlowMage", "AlgoKnight", "MorningHealer", user?.nickname ?? "QuestRunner"].map((name, index) => (
            <div key={name} className="flex items-center justify-between rounded-2xl liquid-panel-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">{name[0]}</div>
                <div>
                  <p className="font-semibold text-ink">{name}</p>
                  <p className="text-sm text-slate-600">Lv.{index + 5} online</p>
                </div>
              </div>
              <button className="rounded-2xl border border-white/45 px-3 py-2 text-sm text-slate-600">프로필 보기</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-2xl text-ink">Plaza Chat</p>
        <div className="mt-4 h-[420px] space-y-3 overflow-y-auto rounded-[28px] liquid-panel-soft p-4">
          {messages.map((message, index) => (
            <div key={`${message.sentAt}-${index}-${message.senderNickname}`} className="rounded-2xl liquid-panel-deep p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{message.senderNickname}</span>
                <span className="text-slate-500">{message.sentAt}</span>
              </div>
              <p className="mt-2 text-slate-600">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-2xl liquid-input px-4 py-3 outline-none"
            placeholder="광장에 메시지를 보내보세요"
          />
          <button className="rounded-2xl bg-accent px-4 py-3 text-[#35516a]" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
