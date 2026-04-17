import { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";
import EmojiPicker from "../ui/EmojiPicker.jsx";

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const groupReactions = (reactions) => {
  const groups = {};
  (reactions || []).forEach((r) => {
    if (!groups[r.emoji])
      groups[r.emoji] = { emoji: r.emoji, count: 0, userIds: [], userNames: [] };
    groups[r.emoji].count++;
    groups[r.emoji].userIds.push(r.userId);
    groups[r.emoji].userNames.push(r.userName);
  });
  return Object.values(groups);
};

function MessageBubble({
  msg,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  onRemoveReact,
  isEditing,
  editContent,
  onEditChange,
  onEditSave,
  onEditCancel,
  isDeleting,
  onDeleteConfirm,
  onDeleteCancel,
}) {
  const [hovered, setHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const isOwn = msg.senderId === currentUserId;
  const reactions = groupReactions(msg.reactions);
  const textParts = parseText(msg.text);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowPicker(false); }}
      style={{
        position: "relative",
        display: "flex",
        gap: 10,
        padding: "6px 20px",
        borderRadius: 6,
        background: hovered ? "rgba(0,0,0,0.02)" : "transparent",
        transition: "background 0.1s",
      }}
    >
      {/* Sender avatar — show photo if available, initials otherwise */}
      {msg.avatar_url ? (
        <img
          src={msg.avatar_url}
          alt={msg.senderName}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            marginTop: 2,
          }}
        />
      ) : (
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          <Avatar initials={initials(msg.senderName)} color="#0D9488" size={36} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Sender name + timestamp */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{msg.senderName}</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{msg.time}</span>
          {msg.is_edited && (
            <span style={{ fontSize: 10, color: "#9ca3af", fontStyle: "italic" }}>(edited)</span>
          )}
        </div>

        {/* Message content — edit mode, delete confirm, or plain text */}
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditSave(); }
                if (e.key === "Escape") onEditCancel();
              }}
              autoFocus
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "2px solid #0D9488",
                fontSize: 14,
                resize: "none",
                outline: "none",
                minHeight: 60,
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button
                onClick={onEditSave}
                style={{ fontSize: 12, padding: "4px 10px", background: "#0D9488", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}
              >
                Save
              </button>
              <button
                onClick={onEditCancel}
                style={{ fontSize: 12, padding: "4px 10px", background: "none", color: "#666", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isDeleting ? (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 6, padding: "8px 12px" }}>
            <p style={{ fontSize: 13, color: "#dc2626", margin: "0 0 8px" }}>Delete this message?</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={onDeleteConfirm}
                style={{ fontSize: 12, padding: "4px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}
              >
                Delete
              </button>
              <button
                onClick={onDeleteCancel}
                style={{ fontSize: 12, padding: "4px 10px", background: "none", color: "#666", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, margin: 0 }}>
            {textParts.map((part, i) =>
              part.highlight ? (
                <span key={i} style={{ color: "#1a73e8", fontWeight: 500, cursor: "pointer" }}>
                  {part.value}
                </span>
              ) : (
                <span key={i}>{part.value}</span>
              )
            )}
          </p>
        )}

        {/* Reaction pills */}
        {reactions.length > 0 && !isEditing && !isDeleting && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {reactions.map((r) => {
              const iMine = r.userIds.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  title={r.userNames.join(", ")}
                  onClick={() =>
                    iMine ? onRemoveReact(msg.id, r.emoji) : onReact(msg.id, r.emoji)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "2px 7px",
                    borderRadius: 12,
                    fontSize: 13,
                    cursor: "pointer",
                    border: `1px solid ${iMine ? "#0D9488" : "rgba(0,0,0,0.12)"}`,
                    background: iMine ? "rgba(13,148,136,0.1)" : "rgba(0,0,0,0.04)",
                    transition: "all 0.1s",
                  }}
                >
                  <span>{r.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: iMine ? "#0D9488" : "#666" }}>
                    {r.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover action bar — react, edit, delete */}
      {hovered && !isEditing && !isDeleting && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 4,
            display: "flex",
            gap: 2,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: 2,
          }}
        >
          <div style={{ position: "relative" }}>
            <ActionBtn title="React" onClick={() => setShowPicker((prev) => !prev)}>
              😊
            </ActionBtn>
            {showPicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  marginBottom: 4,
                  zIndex: 100,
                }}
              >
                <EmojiPicker
                  onSelect={(emoji) => { onReact(msg.id, emoji); setShowPicker(false); }}
                  onClose={() => setShowPicker(false)}
                />
              </div>
            )}
          </div>
          {isOwn && (
            <>
              <ActionBtn title="Edit" onClick={() => onEdit(msg.id, msg.text)}>
                ✏️
              </ActionBtn>
              <ActionBtn title="Delete" onClick={() => onDelete(msg.id)}>
                🗑️
              </ActionBtn>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 7px",
        borderRadius: 5,
        fontSize: 14,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {children}
    </button>
  );
}

// Parses @mentions and #channels to highlight them
function parseText(text) {
  if (!text) return [{ value: "", highlight: false }];
  const regex = /(@[\w\s]+|#[\w-]+)/g;
  const parts = [];
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ value: text.slice(last, match.index), highlight: false });
    parts.push({ value: match[0], highlight: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ value: text.slice(last), highlight: false });
  return parts.length ? parts : [{ value: text, highlight: false }];
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: "20px" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0f0f0", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: 120, height: 12, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ width: `${60 + i * 10}%`, height: 14, background: "#f0f0f0", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatArea({
  title,
  memberCount,
  messages,
  onSend,
  isSpace,
  activeView,
  onClose,
  isMaximized,
  onToggleMaximize,
  spaceMembers,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  typingUsers,
  messagesLoading,
  hasMore,
  onLoadMore,
  onTypingChange,   // called with (true/false) so the parent can emit typing events
}) {
  const [input, setInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (!loadingMore) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Reset local state when switching conversations
  useEffect(() => {
    setShowMembers(false);
    setEditingId(null);
    setDeletingId(null);
    // Stop any in-progress typing indicator when the conversation changes
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (onTypingChange) onTypingChange(false);
  }, [title]);

  // Clean up typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleInputChange = (val) => {
    setInput(val);
    // Emit typing:start, then auto-stop after 2 seconds of no keystrokes
    if (onTypingChange) {
      onTypingChange(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTypingChange(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    // Stop typing indicator immediately when message is sent
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (onTypingChange) onTypingChange(false);
    onSend(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || !editingId) return;
    await onEditMessage(editingId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await onDeleteMessage(deletingId);
    setDeletingId(null);
  };

  const handleLoadMore = async () => {
    if (!onLoadMore) return;
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  const displayed = searchQuery
    ? messages.filter(
        (m) =>
          m.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Empty state — no conversation selected
  if (!title || activeView === "home" || activeView === "mentions") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <svg viewBox="0 0 200 180" fill="none" style={{ width: 180, height: 160, marginBottom: 20 }}>
          <rect x="65" y="20" width="80" height="110" rx="8" fill="#e8eaed" stroke="#dadce0" strokeWidth="2" />
          <rect x="80" y="45" width="50" height="4" rx="2" fill="#dadce0" />
          <rect x="80" y="57" width="40" height="4" rx="2" fill="#dadce0" />
          <rect x="80" y="69" width="45" height="4" rx="2" fill="#dadce0" />
          <circle cx="55" cy="140" r="18" fill="#34a853" opacity="0.85" />
          <path d="M48 140l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p style={{ fontSize: 16, color: "#3c4043", fontWeight: 600, margin: "0 0 6px" }}>
          No conversation selected
        </p>
        <p style={{ fontSize: 14, color: "#1a73e8", margin: 0 }}>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 56,
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isSpace && (
              <span style={{ color: "#9ca3af", fontSize: 18, fontWeight: 300 }}>#</span>
            )}
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: 0 }}>{title}</h2>
            {memberCount && (
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>
                · {memberCount} members
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => setShowSearch((p) => !p)} style={iconBtn}>
              🔍 Search
            </button>
            {memberCount && (
              <button
                onClick={() => setShowMembers((p) => !p)}
                style={{
                  ...iconBtn,
                  background: showMembers ? "#e8f0fe" : "none",
                  color: showMembers ? "#1a73e8" : "#666",
                }}
              >
                👥 Members
              </button>
            )}
            <button
              onClick={onToggleMaximize}
              style={iconBtn}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "⊡" : "⊞"}
            </button>
            <button
              onClick={onClose}
              style={{ ...iconBtn, color: "#9ca3af" }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Inline search bar */}
        {showSearch && (
          <div
            style={{
              padding: "8px 20px",
              borderBottom: "1px solid #f3f4f6",
              background: "#fafafa",
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              style={{
                width: "100%",
                padding: "7px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 12 }}>
          {messagesLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {hasMore && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      fontSize: 12,
                      color: "#1a73e8",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 12px",
                    }}
                  >
                    {loadingMore ? "Loading..." : "Load earlier messages"}
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "4px 20px 12px",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Today</span>
                <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              </div>

              {displayed.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  currentUserId={currentUserId}
                  onEdit={(id, text) => {
                    setEditingId(id);
                    setEditContent(text);
                    setDeletingId(null);
                  }}
                  onDelete={(id) => {
                    setDeletingId(id);
                    setEditingId(null);
                  }}
                  onReact={onAddReaction}
                  onRemoveReact={onRemoveReaction}
                  isEditing={editingId === msg.id}
                  editContent={editingId === msg.id ? editContent : ""}
                  onEditChange={setEditContent}
                  onEditSave={handleEditSave}
                  onEditCancel={() => { setEditingId(null); setEditContent(""); }}
                  isDeleting={deletingId === msg.id}
                  onDeleteConfirm={handleDeleteConfirm}
                  onDeleteCancel={() => setDeletingId(null)}
                />
              ))}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Typing indicator */}
        {typingUsers?.length > 0 && (
          <div style={{ padding: "0 20px 6px", fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(", ")} are typing...`}
          </div>
        )}

        {/* Message input */}
        <div style={{ padding: "10px 20px 16px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f9fafb",
              borderRadius: 12,
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              transition: "border-color 0.15s",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${isSpace ? "#" : ""}${title}...`}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "#111",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                cursor: input.trim() ? "pointer" : "not-allowed",
                background: input.trim() ? "#1a73e8" : "#e5e7eb",
                color: input.trim() ? "#fff" : "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Space members side panel */}
      {showMembers && isSpace && (
        <div
          style={{
            width: 260,
            borderLeft: "1px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              height: 56,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>
              Members ({spaceMembers?.length || 0})
            </h3>
            <button
              onClick={() => setShowMembers(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16 }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {(spaceMembers || []).map((m) => (
              <div
                key={m.id || m}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px" }}
              >
                <Avatar
                  initials={initials(m.name || String(m))}
                  color="#0D9488"
                  size={32}
                  avatarUrl={m.avatar_url || null}
                />
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                  {m.name || m}
                  {m.id === currentUserId && (
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}> (you)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 12,
  color: "#666",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 4,
};