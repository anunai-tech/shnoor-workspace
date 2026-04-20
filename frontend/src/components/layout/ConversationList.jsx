import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function ConversationList({
  activeView, onSelectConversation, selectedId,
  navSearchQuery, mentionedMessages, allSpaces, dmConversations, currentUserId,
  className = '',
  // mobile props
  isMobile = false,
  activeMobileTab = 'home',
  dmUsers = [],
  onSelectDM,
  onlineUsers,
}) {
  const [unreadOnly, setUnreadOnly]       = useState(false);
  const [showNewChat, setShowNewChat]     = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  const items = [
    ...allSpaces.map(s => ({
      id: s.id, type: 'space', name: s.name,
      preview: s.last_message_sender ? `${s.last_message_sender}: ${s.last_message}` : 'No messages yet',
      time: s.last_message_at || s.created_at, isGroup: true,
      initials: s.name.substring(0, 2).toUpperCase(), unread: s.unread || 0,
      avatar_url: null,
    })),
    ...(dmConversations || []).map(dm => ({
      id: dm.other_user_id, type: 'dm', name: dm.other_user_name,
      preview: dm.last_message
        ? (dm.last_message_sender_id === currentUserId ? `You: ${dm.last_message}` : dm.last_message)
        : 'No messages yet',
      time: dm.last_message_at, avatar_url: dm.other_user_avatar,
      initials: initials(dm.other_user_name), isGroup: false, unread: 0,
    })),
  ].sort((a, b) => {
    if (!a.time) return 1; if (!b.time) return -1;
    return new Date(b.time) - new Date(a.time);
  });

  // on mobile: filter by which tab is active
  let filtered = [...items];
  if (isMobile && activeMobileTab === 'dms')
    filtered = items.filter(i => i.type === 'dm');
  if (unreadOnly)
    filtered = filtered.filter(i => i.unread > 0);
  if (navSearchQuery?.trim()) {
    const q = navSearchQuery.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.preview?.toLowerCase().includes(q));
  }

  const containerWidth = isMobile ? '100%' : 360;
  const rowPadding     = isMobile ? '14px 16px' : '11px 18px';
  const avatarSize     = isMobile ? 48 : 40;
  const borderRight    = isMobile ? 'none' : '0.5px solid var(--ws-border)';

  // heading text depends on which tab is active on mobile
  const headingText = isMobile && activeMobileTab === 'dms' ? 'Messages' : 'Home';

  // new chat search results on mobile
  const newChatFiltered = (dmUsers || []).filter(u =>
    u.name.toLowerCase().includes(newChatSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  if (activeView === 'mentions') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', width: containerWidth, borderRight, background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', height: 57, borderBottom: '0.5px solid var(--ws-border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>Mentions</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(!mentionedMessages?.length) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ws-text)', fontWeight: 600, margin: '0 0 6px' }}>No mentions yet</p>
              <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>When someone @mentions you, it'll show here</p>
            </div>
          )}
          {(mentionedMessages || []).map((msg, i) => (
            <button key={i}
              onClick={() => onSelectConversation({ id: msg.sourceId, type: msg.sourceType })}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: rowPadding, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '0.5px solid var(--ws-border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {initials(msg.senderName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)' }}>{msg.senderName}</span>
                  <span style={{ fontSize: 11, color: 'var(--ws-text-muted)' }}>{msg.time}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.text}</p>
                <p style={{ fontSize: 11, color: '#1a73e8', margin: 0 }}>in #{msg.source}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', width: containerWidth, borderRight, background: 'var(--ws-bg)', flexShrink: 0, height: '100%' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 0 18px', height: 57, borderBottom: '0.5px solid var(--ws-border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>{headingText}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* new chat button — always visible, especially important on mobile */}
          <button
            onClick={() => { setShowNewChat(p => !p); setNewChatSearch(''); }}
            title="New chat"
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: showNewChat ? 'rgba(26,115,232,0.1)' : 'none',
              border: 'none', cursor: 'pointer', color: showNewChat ? '#1a73e8' : 'var(--ws-text-muted)',
            }}
            onMouseEnter={e => { if (!showNewChat) e.currentTarget.style.background = 'var(--ws-hover)'; }}
            onMouseLeave={e => { if (!showNewChat) e.currentTarget.style.background = 'none'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
          {/* unread toggle */}
          <span style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>Unread</span>
          <button onClick={() => setUnreadOnly(!unreadOnly)} style={{
            position: 'relative', width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: unreadOnly ? '#1a73e8' : 'var(--ws-border)', transition: 'background 0.2s', padding: 0,
          }}>
            <span style={{ position: 'absolute', top: 2, width: 14, height: 14, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: unreadOnly ? 18 : 2 }} />
          </button>
        </div>
      </div>

      {/* new chat search panel */}
      {showNewChat && (
        <div style={{ borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)' }}>
          <div style={{ padding: '8px 12px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)', borderRadius: 8, padding: '6px 10px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input autoFocus value={newChatSearch} onChange={e => setNewChatSearch(e.target.value)}
                placeholder="Search teammates..."
                onKeyDown={e => { if (e.key === 'Escape') setShowNewChat(false); }}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ws-text)' }}
              />
              <button onClick={() => setShowNewChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 14, lineHeight: 1 }}>✕</button>
            </div>
          </div>
          <div style={{ maxHeight: isMobile ? 280 : 200, overflowY: 'auto' }}>
            {newChatFiltered.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', textAlign: 'center', padding: '14px 12px', margin: 0 }}>
                {newChatSearch ? 'No teammates found' : 'No other users yet'}
              </p>
            ) : newChatFiltered.map(u => {
              const isOnline = onlineUsers?.has?.(u.id);
              return (
                <button key={u.id} onClick={() => { onSelectDM?.(u); setShowNewChat(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 16px' : '8px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar initials={u.initials} color={u.color} size={isMobile ? 42 : 32} avatarUrl={u.avatar_url} />
                    {isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#10B981', borderRadius: '50%', border: '2px solid var(--ws-surface)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>{isOnline ? 'Online' : u.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* conversation list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>No conversations yet</p>
          </div>
        )}
        {filtered.map(item => (
          <button key={`${item.type}-${item.id}`} onClick={() => onSelectConversation(item)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: rowPadding, minHeight: isMobile ? 72 : 'auto',
              background: selectedId === item.id ? 'rgba(26,115,232,0.09)' : 'none',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: '0.5px solid var(--ws-border)',
            }}
            onMouseEnter={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
            onMouseLeave={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'none'; }}
          >
            {item.isGroup ? (
              <div style={{ width: avatarSize, height: avatarSize, borderRadius: isMobile ? 14 : 10, background: 'var(--ws-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 15 : 13, fontWeight: 600, color: 'var(--ws-text-muted)', flexShrink: 0 }}>
                #{item.initials[0]}
              </div>
            ) : item.avatar_url ? (
              <img src={item.avatar_url} alt={item.name} style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <Avatar initials={item.initials} color="#0D9488" size={avatarSize} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: item.unread > 0 ? 700 : 500, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.isGroup ? `#${item.name}` : item.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ws-text-muted)', flexShrink: 0, marginLeft: 6 }}>{formatTime(item.time)}</span>
              </div>
              <p style={{ fontSize: isMobile ? 13 : 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.unread > 0 ? 500 : 400 }}>
                {item.preview}
              </p>
            </div>
            {item.unread > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#1a73e8', color: '#fff', borderRadius: 10, padding: '2px 6px', flexShrink: 0 }}>
                {item.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}