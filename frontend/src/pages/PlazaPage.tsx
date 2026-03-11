import { Send, Users } from "lucide-react";
import { useState } from "react";
import { mockChat } from "../data/mockData";

export function PlazaPage() {
  const [messages, setMessages] = useState(mockChat);
  const [draft, setDraft] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <div className="flex items-center gap-3">
          <Users className="text-sky-400" />
          <h1 className="font-display text-2xl text-white">Social Plaza</h1>
        </div>
        <p className="mt-3 text-slate-400">지금 접속한 플레이어와 대화하고 서로의 성장 상태를 구경하세요.</p>
        <div className="mt-6 grid gap-3">
          {["FlowMage", "AlgoKnight", "MorningHealer", "QuestRunner"].map((name, index) => (
            <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">{name[0]}</div>
                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-sm text-slate-400">Lv.{index + 5} online</p>
                </div>
              </div>
              <button className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-300">프로필 보기</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-2xl text-white">Plaza Chat</p>
        <div className="mt-4 h-[420px] space-y-3 overflow-y-auto rounded-[28px] bg-slate-900/80 p-4">
          {messages.map((message, index) => (
            <div key={`${message.sentAt}-${index}`} className="rounded-2xl bg-slate-800/80 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{message.senderNickname}</span>
                <span className="text-slate-500">{message.sentAt}</span>
              </div>
              <p className="mt-2 text-slate-300">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none"
            placeholder="광장에 메시지를 보내세요"
          />
          <button
            className="rounded-2xl bg-accent px-4 py-3 text-slate-950"
            onClick={() => {
              if (!draft.trim()) return;
              setMessages((prev) => [...prev, { senderNickname: "QuestRunner", content: draft, roomId: "plaza", sentAt: "방금" }]);
              setDraft("");
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
