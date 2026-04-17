import { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";
import { useSocket } from "../../context/SocketContext.jsx";

const ChevronIcon = ({ isOpen }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
  >
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
  </svg>
);

// Inline panel shown when user clicks "New chat"
// Lets them search all workspace members and start a DM with one click
function NewChatPicker({ dmUsers, onSelectDM, onlineUsers, onClose }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = (dmUsers || []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        borderTop: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
        background: "#fafafa",
      }}
    >
      {/* Search bar */}
      <div style={{ padding: "8px 10px 6px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "5px 10px",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teammates..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 12,
              background: "transparent",
              color: "#111",
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 14,
              lineHeight: 1,
              padding: "1px 2px",
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* User list */}
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textAlign: "center",
              padding: "14px 12px",
            }}
          >
            {search ? "No teammates found" : "No other users yet"}
          </p>
        ) : (
          filtered.map((user) => {
            const isOnline = onlineUsers.has(user.id);
            return (
              <button
                key={user.id}
                onClick={() => { onSelectDM(user); onClose(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    initials={user.initials}
                    color={user.color}
                    size={26}
                    avatarUrl={user.avatar_url}
                  />
                  {isOnline && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 8,
                        height: 8,
                        background: "#10B981",
                        borderRadius: "50%",
                        border: "1.5px solid #fafafa",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#1f1f1f",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isOnline ? "Online" : user.email}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function LeftSidebar({
  isOpen,
  onSelectSpace,
  onSelectDM,
  activeSpace,
  activeDM,
  activeView,
  onHomeClick,
  onMentionsClick,
  onCreateSpace,
  allSpaces,
  currentUser,
  dmUsers,
}) {
  const { onlineUsers } = useSocket();
  const [shortcutsOpen, setShortcutsOpen] = useState(true);
  const [dmOpen, setDmOpen] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      onCreateSpace(newSpaceName.trim());
      setNewSpaceName("");
      setShowCreateSpace(false);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white border-r border-gray-200 flex-shrink-0 h-full transition-all duration-300 overflow-hidden ${
        isOpen ? "w-[220px]" : "w-0"
      }`}
    >
      <div className="w-[220px] flex flex-col h-full">

        {/* New chat button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-full shadow-sm transition-all text-[14px] font-medium w-full ${
              showNewChat
                ? "bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] shadow-none"
                : "bg-white border-gray-300 text-[#3c4043] hover:shadow-md hover:bg-gray-50"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            New chat
          </button>
        </div>

        {/* User picker panel — appears under the New chat button when active */}
        {showNewChat && (
          <NewChatPicker
            dmUsers={dmUsers}
            onSelectDM={onSelectDM}
            onlineUsers={onlineUsers}
            onClose={() => setShowNewChat(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto px-1 py-1">

          {/* Shortcuts */}
          <div className="mb-0.5">
            <button
              onClick={() => setShortcutsOpen(!shortcutsOpen)}
              className="w-full flex items-center gap-2 px-3 py-[7px] rounded-full text-left hover:bg-gray-100 transition-colors"
            >
              <ChevronIcon isOpen={shortcutsOpen} />
              <span className="text-[13px] font-medium text-[#1f1f1f]">Shortcuts</span>
            </button>
            {shortcutsOpen && (
              <div className="ml-5 mt-0.5">
                <button
                  onClick={onHomeClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-full text-left hover:bg-gray-100 transition-colors ${
                    activeView === "home" ? "bg-[#e8f0fe]" : ""
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="text-[13px] text-[#3c4043]">Home</span>
                </button>
                <button
                  onClick={onMentionsClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-full text-left hover:bg-gray-100 transition-colors ${
                    activeView === "mentions" ? "bg-[#e8f0fe]" : ""
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94" />
                  </svg>
                  <span className="text-[13px] text-[#3c4043]">Mentions</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div className="mb-0.5">
            <button
              onClick={() => setDmOpen(!dmOpen)}
              className="w-full flex items-center gap-2 px-3 py-[7px] rounded-full text-left hover:bg-gray-100 transition-colors"
            >
              <span className="text-[13px] font-medium text-[#5f6368] w-[10px] text-center">
                {dmOpen ? "–" : "+"}
              </span>
              <span className="text-[13px] font-medium text-[#1f1f1f]">Direct messages</span>
            </button>
            {dmOpen && (
              <div className="mt-0.5">
                {(dmUsers || []).map((member) => {
                  const isOnline = onlineUsers.has(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => onSelectDM && onSelectDM(member)}
                      className={`w-full flex items-center gap-2.5 px-4 py-[5px] text-left hover:bg-gray-100 transition-colors ${
                        activeDM?.id === member.id ? "bg-[#e8f0fe]" : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          initials={member.initials}
                          color={member.color}
                          size={28}
                          avatarUrl={member.avatar_url}
                        />
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-[#10B981] rounded-full border-2 border-white" />
                        )}
                      </div>
                      <span className="text-[13px] text-[#3c4043] truncate">{member.name}</span>
                    </button>
                  );
                })}
                {(dmUsers || []).length === 0 && (
                  <p className="text-[12px] text-[#9ca3af] px-4 py-2">No other users yet</p>
                )}
              </div>
            )}
          </div>

          {/* Spaces */}
          <div className="mb-0.5">
            <button
              onClick={() => setSpacesOpen(!spacesOpen)}
              className="w-full flex items-center gap-2 px-3 py-[7px] rounded-full text-left hover:bg-gray-100 transition-colors"
            >
              <ChevronIcon isOpen={spacesOpen} />
              <span className="text-[13px] font-medium text-[#1f1f1f]">Spaces</span>
            </button>
            {spacesOpen && (
              <div className="ml-2 mt-0.5">
                <button
                  onClick={() => setShowCreateSpace(!showCreateSpace)}
                  className="w-full flex items-center gap-2.5 px-3 py-[6px] rounded-full text-left hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span className="text-[13px] text-[#1a73e8] font-medium">Create a new space</span>
                </button>

                {showCreateSpace && (
                  <div className="mx-3 my-1.5 flex flex-col gap-1.5">
                    <input
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateSpace(); }}
                      placeholder="Space name..."
                      className="w-full px-3 py-1.5 text-[12px] border border-gray-300 rounded-lg outline-none focus:border-[#1a73e8] transition-all"
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleCreateSpace}
                        className="px-3 py-1 text-[11px] font-medium bg-[#1a73e8] text-white rounded-md hover:bg-[#1557b0] transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => { setShowCreateSpace(false); setNewSpaceName(""); }}
                        className="px-3 py-1 text-[11px] font-medium text-[#5f6368] hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {(allSpaces || []).map((space) => (
                  <button
                    key={space.id}
                    onClick={() => onSelectSpace && onSelectSpace(space)}
                    className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-full text-left hover:bg-gray-100 transition-colors ${
                      activeSpace?.id === space.id ? "bg-[#e8f0fe]" : ""
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-[13px] text-[#3c4043] truncate flex-1">{space.name}</span>
                    {space.unread > 0 && (
                      <span className="text-[11px] font-semibold bg-[#1a73e8] text-white rounded-full px-1.5 min-w-[18px] text-center">
                        {space.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}