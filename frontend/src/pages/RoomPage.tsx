import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Copy, DoorOpen, MessageSquare, Move, Save, Settings2, Sparkles, Sofa, Users2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { AvatarPreview3D } from "../components/AvatarPreview3D";
import { FurnitureArtwork, getItemFlavor } from "../components/LifeGameArt";
import { connectChat, type ChatConnection } from "../services/chat";
import { ChatMessage, RoomPlacement, RoomUpdatePayload, ShopItem } from "../types";

const WALL_THEMES = [
  { value: "mint", label: "Mint Glass" },
  { value: "sunset", label: "Sunset Peach" },
  { value: "sky", label: "Sky Blue" }
];

const FLOOR_THEMES = [
  { value: "wood", label: "Wood Floor" },
  { value: "cloud", label: "Cloud Mat" },
  { value: "check", label: "Checker Tile" }
];

type RoomDraft = RoomUpdatePayload;

export function RoomPage() {
  const { user, shopItems, loadShopItems, updateRoom, addGuestbookEntry, fetchRoomByInvite, addGuestbookEntryToRoom } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState<RoomDraft | null>(null);
  const [roomUser, setRoomUser] = useState<typeof user>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [guestbookDraft, setGuestbookDraft] = useState("");
  const [guestbookBusy, setGuestbookBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatConnected, setChatConnected] = useState(false);
  const [chatError, setChatError] = useState("");
  const roomRef = useRef<HTMLDivElement | null>(null);
  const connectionRef = useRef<ChatConnection | null>(null);
  const inviteCode = searchParams.get("invite")?.trim() ?? "";
  const isVisitingOtherRoom = !!user && !!inviteCode && inviteCode !== user.room.inviteCode;

  useEffect(() => {
    if (shopItems.length === 0) {
      void loadShopItems().catch(() => undefined);
    }
  }, [loadShopItems, shopItems.length]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!inviteCode || inviteCode === user.room.inviteCode) {
      setRoomUser(user);
      setLoadingInvite(false);
      return;
    }

    let cancelled = false;
    setLoadingInvite(true);
    void fetchRoomByInvite(inviteCode)
      .then((responseUser) => {
        if (!cancelled) {
          setRoomUser(responseUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoomUser(user);
          setFeedback("Could not find that invite room. Showing your room instead.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingInvite(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchRoomByInvite, inviteCode, user]);

  useEffect(() => {
    if (!roomUser) {
      return;
    }

    setDraft({
      title: roomUser.room.title,
      isPublic: roomUser.room.isPublic,
      allowGuestbook: roomUser.room.allowGuestbook,
      restMode: roomUser.room.restMode,
      wallTheme: roomUser.room.wallTheme,
      floorTheme: roomUser.room.floorTheme,
      moodMessage: roomUser.room.moodMessage,
      placements: roomUser.room.placements
    });
  }, [roomUser]);

  useEffect(() => {
    if (!roomUser) {
      return;
    }

    setChatMessages([
      {
        senderNickname: "System",
        content: `${roomUser.nickname}'s room chat is live. Leave quick updates here in real time.`,
        roomId: `room-${roomUser.id}`,
        sentAt: "Now"
      }
    ]);

    let cancelled = false;

    void connectChat(`room-${roomUser.id}`, (message) => {
      setChatMessages((prev) => [...prev, message]);
      setChatConnected(true);
    })
      .then((connection) => {
        if (cancelled) {
          connection.disconnect();
          return;
        }
        connectionRef.current = connection;
        setChatConnected(true);
        setChatError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setChatConnected(false);
        setChatError(error instanceof Error ? error.message : "Could not connect room chat.");
      });

    return () => {
      cancelled = true;
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      setChatConnected(false);
    };
  }, [roomUser?.id, roomUser?.nickname]);

  useEffect(() => {
    if (!draggingItemId) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      if (!roomRef.current || !draft) {
        return;
      }
      const rect = roomRef.current.getBoundingClientRect();
      const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100, 8, 92);
      const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100, 16, 90);
      setDraft((current) =>
        current
          ? {
              ...current,
              placements: current.placements.map((placement) =>
                placement.itemId === draggingItemId ? { ...placement, x, y } : placement
              )
            }
          : current
      );
    };

    const handleUp = () => {
      setDraggingItemId(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [draggingItemId, draft]);

  const ownedFurniture = useMemo(() => {
    if (!roomUser) {
      return [];
    }
    const ownedIds = new Set(roomUser.ownedItemIds);
    return shopItems.filter((item) => ownedIds.has(item.itemId) && item.type === "room_furniture");
  }, [roomUser, shopItems]);

  const placementItems = useMemo(() => {
    if (!draft) {
      return [];
    }
    return [...draft.placements]
      .map((placement) => ({
        placement,
        item: ownedFurniture.find((entry) => entry.itemId === placement.itemId)
      }))
      .filter((entry): entry is { placement: RoomPlacement; item: ShopItem } => !!entry.item)
      .sort((left, right) => left.placement.layer - right.placement.layer || left.placement.y - right.placement.y);
  }, [draft, ownedFurniture]);

  const selectedFurniture = ownedFurniture.find((item) => item.itemId === selectedFurnitureId) ?? null;

  if (!user || !roomUser || !draft || loadingInvite) {
    return null;
  }

  const placeSelectedFurniture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFurnitureId || !roomRef.current) {
      return;
    }

    const rect = roomRef.current.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100, 8, 92);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100, 16, 90);

    setDraft((current) =>
      current
        ? {
            ...current,
            placements: upsertPlacement(current.placements, {
              itemId: selectedFurnitureId,
              x,
              y,
              layer: y > 68 ? 1 : 2
            })
          }
        : current
    );
    setFeedback(`Placed ${selectedFurniture?.name ?? "furniture"} in the room.`);
  };

  const removePlacement = (itemId: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            placements: current.placements.filter((placement) => placement.itemId !== itemId)
          }
        : current
    );
    if (selectedFurnitureId === itemId) {
      setSelectedFurnitureId(null);
    }
  };

  const saveRoomState = async () => {
    setSaving(true);
    setFeedback("");
    try {
      await updateRoom(draft);
      setFeedback("My Room saved and synced.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save room.");
    } finally {
      setSaving(false);
    }
  };

  const handleGuestbookSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guestbookDraft.trim()) {
      return;
    }
    setGuestbookBusy(true);
    setFeedback("");
    try {
      if (isVisitingOtherRoom) {
        const updatedRoomOwner = await addGuestbookEntryToRoom(roomUser.room.inviteCode, guestbookDraft.trim());
        setRoomUser(updatedRoomOwner);
      } else {
        await addGuestbookEntry(guestbookDraft.trim());
      }
      setGuestbookDraft("");
      setFeedback("Guestbook entry added.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not add guestbook entry.");
    } finally {
      setGuestbookBusy(false);
    }
  };

  const handleCopyInvite = async () => {
    const inviteCodeOnly = roomUser.room.inviteCode;
    try {
      await navigator.clipboard.writeText(inviteCodeOnly);
      setInviteFeedback("Invite code copied.");
    } catch {
      setInviteFeedback(inviteCodeOnly);
    }
  };

  const handleJoinRoom = () => {
    const normalized = joinCode.trim();
    if (!normalized) {
      setInviteFeedback("Enter an invite code first.");
      return;
    }
    setInviteFeedback("");
    setJoinOpen(false);
    setJoinCode("");
    navigate(`/room?invite=${encodeURIComponent(normalized)}`);
  };

  const handleSendChat = () => {
    if (!chatDraft.trim() || !connectionRef.current) {
      return;
    }
    connectionRef.current.send({
      senderNickname: user.nickname,
      content: chatDraft.trim(),
      roomId: `room-${roomUser.id}`,
      sentAt: ""
    });
    setChatDraft("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-ink">{isVisitingOtherRoom ? `${roomUser.nickname}'s Room` : "My Room"}</p>
            <p className="mt-2 text-slate-600">
              {isVisitingOtherRoom
                ? "You entered this room through an invite code. You can explore, chat, and leave a guestbook note."
                : "Your room is now a real editable space. Drag furniture, tune settings, chat live, and leave guestbook notes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setJoinOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
            >
              <DoorOpen size={16} />
              참가하기
            </button>
            {isVisitingOtherRoom ? (
              <button
                type="button"
                onClick={() => navigate("/room")}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
              >
                <ArrowLeft size={16} />
                내 방으로
              </button>
            ) : (
              <Link
                to="/room/settings"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
              >
                <Settings2 size={16} />
                Room settings
              </Link>
            )}
          </div>
        </div>

        {joinOpen ? (
          <div className="mt-4 rounded-[24px] liquid-panel-soft p-4">
            <p className="text-sm font-semibold text-ink">Invite code</p>
            <p className="mt-1 text-sm text-slate-600">Paste a friend's room code and press `참가하기` to visit that room and its guestbook.</p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleJoinRoom();
                  }
                }}
                className="flex-1 rounded-2xl liquid-input px-4 py-3 outline-none"
                placeholder="room-ab12cd34"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-[#35516a]"
              >
                참가하기
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip label={draft.isPublic ? "Public room" : "Private room"} />
          <StatusChip label={draft.allowGuestbook ? "Guestbook open" : "Guestbook closed"} />
          <StatusChip label={draft.restMode ? "Rest mode on" : "Rest mode off"} />
          <StatusChip label={`Invite ${roomUser.room.inviteCode}`} />
        </div>

        <div className={`mt-6 overflow-hidden rounded-[30px] p-5 ${getWallThemeClass(draft.wallTheme)}`}>
          <div
            ref={roomRef}
            onClick={isVisitingOtherRoom ? undefined : placeSelectedFurniture}
            className={`relative h-[540px] overflow-hidden rounded-[28px] border border-white/35 bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur ${
              isVisitingOtherRoom ? "cursor-default" : "cursor-crosshair"
            }`}
          >
            <div className={`absolute inset-x-0 bottom-0 h-[34%] rounded-b-[28px] ${getFloorThemeClass(draft.floorTheme)}`} />
            <div className="absolute left-8 top-10 h-28 w-20 rounded-[24px] border border-white/45 bg-white/35" />
            <div className="absolute left-12 top-14 h-20 w-12 rounded-[18px] bg-sky-200/65" />
            <div className="absolute right-8 top-10 h-24 w-32 rounded-[28px] border border-white/45 bg-white/28" />
            <div className="absolute right-16 top-28 h-2 w-16 rounded-full bg-slate-300/70" />
            <div className="absolute left-6 top-6 max-w-[360px] rounded-[24px] bg-white/60 px-4 py-3 shadow-sm">
              <p className="text-lg font-semibold text-ink">{draft.title}</p>
              <p className="mt-1 text-sm text-slate-600">{draft.moodMessage || "No mood message yet."}</p>
            </div>
            {draft.restMode ? (
              <div className="absolute right-6 top-6 rounded-full bg-emerald-100/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                Rest bonus active
              </div>
            ) : null}

            <div className="absolute bottom-[18px] left-1/2 z-20 -translate-x-1/2 scale-[0.8]">
              <AvatarPreview3D
                nickname={roomUser.nickname}
                hair={roomUser.avatar.hair}
                clothes={roomUser.avatar.clothes}
                accessories={roomUser.avatar.accessories}
                skinColor={roomUser.avatar.colors.skin}
                hairColor={roomUser.avatar.colors.hair}
                clothesColor={roomUser.avatar.colors.clothes}
                showCaption={false}
                spinDurationSeconds={18}
                characterScale={1.04}
                verticalOffset={0}
                variant="embedded"
              />
            </div>
            <div className="absolute bottom-[32px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              {roomUser.nickname}
            </div>

            {placementItems.map(({ placement, item }) => (
              <button
                key={placement.itemId}
                type="button"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={
                  isVisitingOtherRoom
                    ? undefined
                    : (event) => {
                        event.stopPropagation();
                        setDraggingItemId(placement.itemId);
                      }
                }
                onDoubleClick={
                  isVisitingOtherRoom
                    ? undefined
                    : (event) => {
                        event.stopPropagation();
                        removePlacement(placement.itemId);
                      }
                }
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-[1.03]"
                style={{ left: `${placement.x}%`, top: `${placement.y}%`, zIndex: 15 + placement.layer * 5 + placement.y }}
                title={isVisitingOtherRoom ? "Room decor" : "Drag to move. Double click to remove."}
              >
                <FurnitureArtwork item={item} compact className="rounded-[24px] border border-white/45 bg-white/58 shadow-[0_12px_28px_rgba(117,145,171,0.18)]" />
              </button>
            ))}

            {selectedFurniture && !isVisitingOtherRoom ? (
              <div className="absolute bottom-6 left-6 rounded-[22px] bg-white/65 px-4 py-3 text-sm text-slate-600 shadow-sm">
                Click anywhere in the room to place <span className="font-semibold text-ink">{selectedFurniture.name}</span>.
              </div>
            ) : null}
          </div>
        </div>

        {feedback ? <div className="mt-4 rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{feedback}</div> : null}
      </section>

      <section className="space-y-4">
        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Sofa size={18} className="text-reward" />
            <p className="font-display text-xl text-ink">{isVisitingOtherRoom ? "Room Decor" : "Furniture Dock"}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {isVisitingOtherRoom ? "Viewing furniture placed in this room." : "Select owned furniture, then click the room to place it. Drag placed furniture to move it."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {ownedFurniture.map((item) => {
              const active = selectedFurnitureId === item.itemId;
              const placed = draft.placements.some((placement) => placement.itemId === item.itemId);
              return (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => {
                    if (!isVisitingOtherRoom) {
                      setSelectedFurnitureId((prev) => (prev === item.itemId ? null : item.itemId));
                    }
                  }}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    active ? "border-accent bg-accent/10" : "border-white/45 bg-white/45 hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <FurnitureArtwork item={item} compact className="rounded-[20px] bg-white/80" />
                    {placed ? <span className="rounded-full bg-reward/15 px-2 py-1 text-[10px] font-semibold text-reward">Placed</span> : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{getItemFlavor(item)}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-3">
            {!isVisitingOtherRoom ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedFurnitureId(null)}
                  className="flex-1 rounded-2xl border border-white/45 px-4 py-3 text-sm text-slate-600"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveRoomState()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
                >
                  <Save size={16} />
                  Save room
                </button>
              </>
            ) : (
              <div className="w-full rounded-2xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">
                Invite visits are view-only for furniture and layout.
              </div>
            )}
          </div>
        </div>

        {!isVisitingOtherRoom ? <RoomSettingsCard draft={draft} onChange={setDraft} onSave={saveRoomState} saving={saving} /> : null}

        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Users2 size={18} className="text-sky-500" />
            <p className="font-display text-xl text-ink">Invite & Guestbook</p>
          </div>
          <div className="mt-4 rounded-[24px] liquid-panel-soft p-4">
            <p className="text-sm font-semibold text-ink">Invite code</p>
            <p className="mt-1 text-sm text-slate-600">Share only this room code. No URL is needed.</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">{roomUser.room.inviteCode}</p>
            <button
              type="button"
              onClick={() => void handleCopyInvite()}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <Copy size={16} />
              Copy invite code
            </button>
            {inviteFeedback ? <p className="mt-2 text-xs text-slate-500">{inviteFeedback}</p> : null}
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleGuestbookSubmit}>
            <textarea
              value={guestbookDraft}
              onChange={(event) => setGuestbookDraft(event.target.value)}
              className="h-28 w-full rounded-2xl liquid-input px-4 py-3 outline-none"
              placeholder={draft.allowGuestbook ? "Leave a note in your room guestbook." : "Guestbook is currently closed."}
              disabled={!draft.allowGuestbook || guestbookBusy}
            />
            <button
              type="submit"
              disabled={!draft.allowGuestbook || guestbookBusy || !guestbookDraft.trim()}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
            >
              {guestbookBusy ? "Posting..." : "Post to guestbook"}
            </button>
          </form>

          <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
            {roomUser.room.guestbookEntries.length === 0 ? (
              <div className="rounded-2xl liquid-panel-soft p-4 text-sm text-slate-500">No guestbook entries yet.</div>
            ) : (
              roomUser.room.guestbookEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl liquid-panel-soft p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-ink">{entry.author}</span>
                    <span className="text-xs text-slate-500">{entry.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{entry.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-accent" />
            <p className="font-display text-xl text-ink">Room Chat</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Status: <span className={chatConnected ? "text-accent" : "text-amber-700"}>{chatConnected ? "Live" : "Connecting..."}</span>
          </p>
          {chatError ? <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{chatError}</div> : null}
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto rounded-[24px] liquid-panel-soft p-4">
            {chatMessages.map((message, index) => (
              <div key={`${message.sentAt}-${message.senderNickname}-${index}`} className="rounded-2xl bg-white/55 px-3 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">{message.senderNickname}</span>
                  <span className="text-slate-500">{message.sentAt}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{message.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <input
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendChat();
                }
              }}
              className="flex-1 rounded-2xl liquid-input px-4 py-3 outline-none"
              placeholder="Send a quick room update"
            />
            <button className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-[#35516a]" onClick={handleSendChat}>
              Send
            </button>
          </div>
        </div>

        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Move size={18} className="text-slate-500" />
            <p className="font-display text-xl text-ink">Recent Room Activity</p>
          </div>
          <div className="mt-4 space-y-3">
            {roomUser.room.activityEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl liquid-panel-soft p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{entry.actor}</span>
                  <span className="text-xs text-slate-500">{entry.createdAt}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function RoomSettingsPage() {
  const { user, updateRoom } = useApp();
  const [draft, setDraft] = useState<RoomDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }
    setDraft({
      title: user.room.title,
      isPublic: user.room.isPublic,
      allowGuestbook: user.room.allowGuestbook,
      restMode: user.room.restMode,
      wallTheme: user.room.wallTheme,
      floorTheme: user.room.floorTheme,
      moodMessage: user.room.moodMessage,
      placements: user.room.placements
    });
  }, [user]);

  if (!user || !draft) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setFeedback("");
    try {
      await updateRoom(draft);
      setFeedback("Room settings saved.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save room settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[32px] liquid-panel p-6">
        <div>
          <p className="font-display text-3xl text-ink">Room Settings</p>
          <p className="mt-2 text-slate-600">Everything here persists to My Room immediately after save, including mood, visibility, and decoration themes.</p>
        </div>
        <Link
          to="/room"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to My Room
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-xl text-ink">Room Snapshot</p>
          <div className="mt-5 rounded-[30px] bg-slate-900 px-5 py-5 text-white">
            <p className="text-lg font-semibold">{draft.title}</p>
            <p className="mt-2 text-sm text-white/70">{draft.moodMessage || "No mood message set."}</p>
            <div className="mt-4 grid gap-3 text-sm text-white/80">
              <div className="rounded-2xl bg-white/10 px-4 py-3">Visibility: {draft.isPublic ? "Public" : "Private"}</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">Guestbook: {draft.allowGuestbook ? "Open" : "Closed"}</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">Rest mode: {draft.restMode ? "Enabled" : "Disabled"}</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">Wall / Floor: {draft.wallTheme} / {draft.floorTheme}</div>
            </div>
          </div>
          {feedback ? <div className="mt-4 rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{feedback}</div> : null}
        </div>

        <RoomSettingsCard draft={draft} onChange={setDraft} onSave={handleSave} saving={saving} fullPage />
      </div>
    </div>
  );
}

function RoomSettingsCard({
  draft,
  onChange,
  onSave,
  saving,
  fullPage = false
}: {
  draft: RoomDraft;
  onChange: (draft: RoomDraft) => void;
  onSave: () => Promise<void> | void;
  saving: boolean;
  fullPage?: boolean;
}) {
  return (
    <div className={`rounded-[32px] liquid-panel p-6 ${fullPage ? "" : ""}`}>
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <p className="font-display text-xl text-ink">Room Controls</p>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">Room title</span>
          <input
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className="w-full rounded-2xl liquid-input px-4 py-3 outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">Mood message</span>
          <textarea
            value={draft.moodMessage}
            onChange={(event) => onChange({ ...draft, moodMessage: event.target.value.slice(0, 120) })}
            className="h-24 w-full rounded-2xl liquid-input px-4 py-3 outline-none"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Wall theme</span>
            <select
              value={draft.wallTheme}
              onChange={(event) => onChange({ ...draft, wallTheme: event.target.value })}
              className="w-full rounded-2xl liquid-input px-4 py-3 outline-none"
            >
              {WALL_THEMES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Floor theme</span>
            <select
              value={draft.floorTheme}
              onChange={(event) => onChange({ ...draft, floorTheme: event.target.value })}
              className="w-full rounded-2xl liquid-input px-4 py-3 outline-none"
            >
              {FLOOR_THEMES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ToggleRow
          label="Public room"
          description="Allow this room to be shareable with an invite link."
          value={draft.isPublic}
          onToggle={() => onChange({ ...draft, isPublic: !draft.isPublic })}
        />
        <ToggleRow
          label="Guestbook enabled"
          description="Let guests and you leave notes that persist in the room."
          value={draft.allowGuestbook}
          onToggle={() => onChange({ ...draft, allowGuestbook: !draft.allowGuestbook })}
        />
        <ToggleRow
          label="Rest mode"
          description="Show the room as a comfort zone with a small rest bonus badge."
          value={draft.restMode}
          onToggle={() => onChange({ ...draft, restMode: !draft.restMode })}
        />

        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
        >
          {saving ? "Saving..." : "Save room settings"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-2xl liquid-panel-soft px-4 py-4 text-left">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value ? "bg-accent/15 text-accent" : "bg-slate-200 text-slate-500"}`}>
        {value ? "On" : "Off"}
      </span>
    </button>
  );
}

function upsertPlacement(placements: RoomPlacement[], nextPlacement: RoomPlacement) {
  const next = placements.filter((placement) => placement.itemId !== nextPlacement.itemId);
  return [...next, nextPlacement];
}

function clampPercent(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number(value.toFixed(1))));
}

function StatusChip({ label }: { label: string }) {
  return <span className="rounded-full border border-white/45 bg-white/45 px-3 py-1.5 text-xs font-semibold text-slate-600">{label}</span>;
}

function getWallThemeClass(theme: string) {
  switch (theme) {
    case "sunset":
      return "bg-[linear-gradient(180deg,rgba(255,240,232,0.96),rgba(255,218,208,0.92),rgba(255,236,220,0.96))]";
    case "sky":
      return "bg-[linear-gradient(180deg,rgba(226,240,255,0.98),rgba(210,232,255,0.94),rgba(234,246,255,0.96))]";
    default:
      return "bg-[linear-gradient(180deg,rgba(239,251,245,0.98),rgba(218,243,236,0.94),rgba(232,245,255,0.96))]";
  }
}

function getFloorThemeClass(theme: string) {
  switch (theme) {
    case "cloud":
      return "bg-[linear-gradient(180deg,rgba(243,247,255,0.9),rgba(228,236,255,0.96))]";
    case "check":
      return "bg-[linear-gradient(45deg,rgba(240,240,250,0.95)_25%,rgba(225,230,245,0.95)_25%,rgba(225,230,245,0.95)_50%,rgba(240,240,250,0.95)_50%,rgba(240,240,250,0.95)_75%,rgba(225,230,245,0.95)_75%)] bg-[length:30px_30px]";
    default:
      return "bg-[linear-gradient(180deg,rgba(213,184,150,0.95),rgba(188,154,116,0.95))]";
  }
}
