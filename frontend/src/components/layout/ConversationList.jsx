import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function ConversationList({
  activeView, onSelectConversation, selectedId,
  navSearchQuery, mentionedMessages, allSpaces, dmConversations, currentUserId,
}) {
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Build unified list from real spaces + real DM conversations
  const items = [
    ...allSpaces.map(s => ({
      id: s.id,
      type: 'space',
      name: s.name,
      preview: s.last_message_sender
        ? `${s.last_message_sender}: ${s.last_message}`
        : 'No messages yet',
      time: s.last_message_at || s.created_at,
      initials: s.name.substring(0, 2).toUpperCase(),
      isGroup: true,
      memberCount: s.member_count,
      unread: s.unread || 0,
    })),
    ...(dmConversations || []).map(dm => ({
      id: dm.other_user_id,
      type: 'dm',
      name: dm.other_user_name,
      preview: dm.last_message
        ? dm.last_message_sender_id === currentUserId
          ? `You: ${dm.last_message}`
          : dm.last_message
        : 'No messages yet',
      time: dm.last_message_at,
      avatar_url: dm.other_user_avatar,
      initials: initials(dm.other_user_name),
      isGroup: false,
      unread: 0,
    })),
  ].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time) - new Date(a.time);
  });

  let filtered = unreadOnly ? items.filter(i => i.unread > 0) : items;

  if (navSearchQuery?.trim()) {
    const q = navSearchQuery.toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(q) || i.preview?.toLowerCase().includes(q)
    );
  }

  if (activeView === 'mentions') {
    return (
      <div className="flex flex-col w-[380px] border-r border-gray-200 bg-white flex-shrink-0 h-full">
        <div className="flex items-center px-5 h-[56px] border-b border-gray-100">
          <h2 className="text-[22px] font-normal text-[#1f1f1f]">Mentions</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mentionedMessages?.length > 0 ? mentionedMessages.map((msg, i) => (
            <button key={i}
              onClick={() => onSelectConversation({ id: msg.sourceId, type: msg.sourceType })}
              className="w-full flex items-start gap-3 px-5 py-3.5 text-left border-b border-gray-50 hover:bg-gray-50"
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {initials(msg.senderName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[14px] font-semibold text-[#1f1f1f] truncate">{msg.senderName}</span>
                  <span className="text-[12px] text-[#5f6368]">{msg.time}</span>
                </div>
                <p className="text-[13px] text-[#5f6368] truncate">{msg.text}</p>
                <p className="text-[11px] text-[#1a73e8] mt-0.5">in #{msg.source}</p>
              </div>
            </button>
          )) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-[14px] text-[#3c4043] font-medium">No mentions yet</p>
              <p className="text-[13px] text-[#5f6368] mt-1">When someone mentions you, it'll show up here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[380px] border-r border-gray-200 bg-white flex-shrink-0 h-full">
      <div className="flex items-center justify-between px-5 h-[56px] border-b border-gray-100 flex-shrink-0">
        <h2 className="text-[22px] font-normal text-[#1f1f1f]">Home</h2>
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-[#5f6368] mr-1">Unread</span>
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-200 ${unreadOnly ? 'bg-[#1a73e8]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform duration-200 ${unreadOnly ? 'left-[18px]' : 'left-[2px]'}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-[14px] text-[#5f6368]">No conversations yet</p>
          </div>
        )}

        {filtered.map(item => (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => onSelectConversation(item)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-b border-gray-50 transition-colors ${selectedId === item.id ? 'bg-[#e8f0fe]' : 'hover:bg-[#f8f9fa]'}`}
          >
            {item.isGroup ? (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#5f6368', flexShrink: 0 }}>
                #{item.initials[0]}
              </div>
            ) : (
              item.avatar_url ? (
                <img src={item.avatar_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <Avatar initials={item.initials} color="#0D9488" size={40} />
              )
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[14px] truncate ${item.unread > 0 ? 'font-semibold text-[#1f1f1f]' : 'font-medium text-[#3c4043]'}`}>
                  {item.isGroup ? `#${item.name}` : item.name}
                </span>
                <span className="text-[12px] text-[#5f6368] flex-shrink-0 ml-2">{formatTime(item.time)}</span>
              </div>
              <p className={`text-[13px] truncate ${item.unread > 0 ? 'text-[#3c4043] font-medium' : 'text-[#5f6368]'}`}>
                {item.preview || 'No messages yet'}
              </p>
            </div>

            {item.unread > 0 && (
              <span className="text-[11px] font-semibold bg-[#1a73e8] text-white rounded-full px-1.5 min-w-[18px] text-center flex-shrink-0">
                {item.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}