import { useState } from 'react';
import Avatar from '../ui/Avatar.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

const ChevronIcon = ({ isOpen }) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--ws-text-muted)', flexShrink: 0 }}>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
  </svg>
);

// search box that pops open inside the sidebar to start a new DM
function NewChatPicker({ dmUsers, onSelectDM, onlineUsers, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = (dmUsers || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ borderTop: '0.5px solid var(--ws-border)', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)' }}>
      <div style={{ padding: '7px 10px 5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)', borderRadius: 7, padding: '5px 9px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search teammates..." onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--ws-text)' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', fontSize: 13 }}>✕</button>
        </div>
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', textAlign: 'center', padding: '14px 12px', margin: 0 }}>
            {search ? 'No teammates found' : 'No other users yet'}
          </p>
        ) : filtered.map(user => {
          const isOnline = onlineUsers.has(user.id);
          return (
            <button key={user.id} onClick={() => { onSelectDM(user); onClose(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar initials={user.initials} color={user.color} size={26} avatarUrl={user.avatar_url} />
                {isOnline && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, background: '#10B981', borderRadius: '50%', border: '1.5px solid var(--ws-surface)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ fontSize: 10, color: 'var(--ws-text-muted)', margin: 0 }}>{isOnline ? 'Online' : user.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LeftSidebar({
  isOpen, onSelectSpace, onSelectDM, activeSpace, activeDM, activeView,
  onHomeClick, onMentionsClick, onCreateSpace, allSpaces, currentUser,
  dmUsers, onLoadMoreDMs, dmHasMore, dmLoadingMore, onCloseMobile, className = '',
}) {
  const { onlineUsers } = useSocket();
  const [shortcutsOpen, setShortcutsOpen] = useState(true);
  const [dmOpen,        setDmOpen]        = useState(false);
  const [spacesOpen,    setSpacesOpen]    = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceName,  setNewSpaceName]  = useState('');
  const [showNewChat,   setShowNewChat]   = useState(false);

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) { onCreateSpace(newSpaceName.trim()); setNewSpaceName(''); setShowCreateSpace(false); }
  };

  // icon-only width when collapsed = 52px like the right rail
  const sidebarWidth = isOpen ? 220 : 52;

  const navItemStyle = (active) => ({
    width: '100%', display: 'flex', alignItems: 'center',
    gap: isOpen ? 8 : 0,
    justifyContent: isOpen ? 'flex-start' : 'center',
    padding: isOpen ? '5px 10px' : '8px 0',
    borderRadius: 7,
    background: active ? 'rgba(26,115,232,0.1)' : 'none',
    border: 'none', cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.1s', color: active ? '#1a73e8' : 'var(--ws-text)',
  });

  return (
    <div
      className={`ws-sidebar ${isOpen ? 'open' : ''} ${className}`}
      style={{
        display: 'flex', flexDirection: 'column',
        width: sidebarWidth,
        background: 'var(--ws-sidebar)', borderRight: '0.5px solid var(--ws-border)',
        flexShrink: 0, height: '100%', overflow: 'hidden',
        transition: 'width 0.25s ease',
      }}
    >
      {/* inner scroll area — fixed at 220 so content doesn't reflow during animation */}
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', height: '100%', transform: `translateX(${isOpen ? 0 : -168}px)`, transition: 'transform 0.25s ease' }}>

        {/* New chat button */}
        <div style={{ padding: '12px 10px 8px' }}>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            title={isOpen ? '' : 'New chat'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center',
              gap: isOpen ? 8 : 0,
              padding: isOpen ? '8px 12px' : '8px 0',
              borderRadius: 20,
              background: showNewChat ? 'rgba(26,115,232,0.1)' : 'var(--ws-bg)',
              border: `0.5px solid ${showNewChat ? '#1a73e8' : 'var(--ws-border)'}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              color: showNewChat ? '#1a73e8' : 'var(--ws-text)',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            {isOpen && 'New chat'}
          </button>
        </div>

        {showNewChat && isOpen && (
          <NewChatPicker dmUsers={dmUsers} onSelectDM={(u) => { onSelectDM(u); onCloseMobile?.(); }} onlineUsers={onlineUsers} onClose={() => setShowNewChat(false)} />
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: isOpen ? '2px 6px' : '2px 4px' }}>

          {/* Shortcuts section */}
          <div style={{ marginBottom: 2 }}>
            {isOpen && (
              <button onClick={() => setShortcutsOpen(!shortcutsOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
                <ChevronIcon isOpen={shortcutsOpen} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Shortcuts</span>
              </button>
            )}
            <div style={{ paddingLeft: isOpen ? 14 : 0 }}>
              <button onClick={() => { onHomeClick(); onCloseMobile?.(); }}
                style={navItemStyle(activeView === 'home')} title={isOpen ? '' : 'Home'}
                onMouseEnter={e => { if (activeView !== 'home') e.currentTarget.style.background = 'var(--ws-hover)'; }}
                onMouseLeave={e => { if (activeView !== 'home') e.currentTarget.style.background = 'none'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {isOpen && <span style={{ fontSize: 12 }}>Home</span>}
              </button>
              <button onClick={() => { onMentionsClick(); onCloseMobile?.(); }}
                style={navItemStyle(activeView === 'mentions')} title={isOpen ? '' : 'Mentions'}
                onMouseEnter={e => { if (activeView !== 'mentions') e.currentTarget.style.background = 'var(--ws-hover)'; }}
                onMouseLeave={e => { if (activeView !== 'mentions') e.currentTarget.style.background = 'none'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94"/>
                </svg>
                {isOpen && <span style={{ fontSize: 12 }}>Mentions</span>}
              </button>
            </div>
          </div>

          {/* Direct messages */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => setDmOpen(!dmOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center', gap: 6, padding: isOpen ? '5px 8px' : '8px 0', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}
              title={isOpen ? '' : 'Direct messages'}
            >
              {isOpen ? (
                <>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ws-text-muted)', width: 10 }}>{dmOpen ? '−' : '+'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Direct messages</span>
                </>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )}
            </button>
            {(dmOpen || !isOpen) && (
              <div>
                {(dmUsers || []).slice(0, isOpen ? undefined : 5).map(member => {
                  const isOnline = onlineUsers.has(member.id);
                  return (
                    <button key={member.id} onClick={() => { onSelectDM?.(member); onCloseMobile?.(); }}
                      style={{ ...navItemStyle(activeDM?.id === member.id), paddingLeft: isOpen ? 10 : 0, position: 'relative' }} title={isOpen ? '' : member.name}
                      onMouseEnter={e => { if (activeDM?.id !== member.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                      onMouseLeave={e => { if (activeDM?.id !== member.id) e.currentTarget.style.background = activeDM?.id === member.id ? 'rgba(26,115,232,0.1)' : 'none'; }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar initials={member.initials} color={member.color} size={24} avatarUrl={member.avatar_url} />
                        {isOnline && <div style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, background: '#10B981', borderRadius: '50%', border: '1.5px solid var(--ws-sidebar)' }} />}
                      </div>
                      {isOpen && <span style={{ fontSize: 12, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{member.name}</span>}
                    </button>
                  );
                })}
                {isOpen && dmHasMore && (
                  <button onClick={onLoadMoreDMs} disabled={dmLoadingMore} style={{ width: '100%', fontSize: 11, color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', textAlign: 'left' }}>
                    {dmLoadingMore ? 'Loading...' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Spaces */}
          <div style={{ marginBottom: 2 }}>
            <button onClick={() => setSpacesOpen(!spacesOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center', gap: 6, padding: isOpen ? '5px 8px' : '8px 0', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}
              title={isOpen ? '' : 'Spaces'}
            >
              {isOpen ? (
                <>
                  <ChevronIcon isOpen={spacesOpen} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ws-text-muted)' }}>Spaces</span>
                </>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )}
            </button>
            {(spacesOpen || !isOpen) && (
              <div style={{ paddingLeft: isOpen ? 14 : 0 }}>
                {isOpen && (
                  <>
                    <button onClick={() => setShowCreateSpace(!showCreateSpace)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      <span style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>Create a new space</span>
                    </button>
                    {showCreateSpace && (
                      <div style={{ padding: '4px 6px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <input value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleCreateSpace(); }}
                          placeholder="Space name..." autoFocus
                          style={{ width: '100%', padding: '5px 9px', fontSize: 12, border: '0.5px solid var(--ws-border)', borderRadius: 6, outline: 'none', boxSizing: 'border-box', background: 'var(--ws-bg)', color: 'var(--ws-text)' }}
                        />
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={handleCreateSpace} style={{ padding: '4px 10px', fontSize: 11, background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Create</button>
                          <button onClick={() => { setShowCreateSpace(false); setNewSpaceName(''); }} style={{ padding: '4px 10px', fontSize: 11, background: 'none', color: 'var(--ws-text-muted)', border: '0.5px solid var(--ws-border)', borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {(allSpaces || []).map(space => (
                  <button key={space.id} onClick={() => { onSelectSpace?.(space); onCloseMobile?.(); }}
                    style={{ ...navItemStyle(activeSpace?.id === space.id), paddingLeft: isOpen ? 8 : 0 }} title={isOpen ? '' : space.name}
                    onMouseEnter={e => { if (activeSpace?.id !== space.id) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                    onMouseLeave={e => { if (activeSpace?.id !== space.id) e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {isOpen && <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{space.name}</span>}
                    {isOpen && space.unread > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#1a73e8', color: '#fff', borderRadius: 10, padding: '1px 5px', flexShrink: 0 }}>{space.unread}</span>
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