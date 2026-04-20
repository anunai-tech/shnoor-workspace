// bottom nav shown only on mobile — 5 tabs
const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#1a73e8' : 'none'}
    stroke={active ? '#1a73e8' : 'var(--ws-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const MessagesIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#1a73e8' : 'none'}
    stroke={active ? '#1a73e8' : 'var(--ws-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const MentionsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#1a73e8' : 'var(--ws-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0V12a10 10 0 1 0-3.92 7.94"/>
  </svg>
);
const CalendarIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#1a73e8' : 'var(--ws-text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TABS = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon },
  { id: 'dms',      label: 'Messages', Icon: MessagesIcon },
  { id: 'mentions', label: 'Mentions', Icon: MentionsIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
];

export default function BottomNav({
  activeMobileTab,
  onTabChange,
  currentUser,
  onOpenProfileSettings,
}) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 60,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'var(--ws-bottom-nav)',
      borderTop: '0.5px solid var(--ws-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 100,
      boxShadow: '0 -1px 8px rgba(0,0,0,0.06)',
    }}>
      {TABS.map(tab => {
        const isActive = activeMobileTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px' }}
          >
            <tab.Icon active={isActive} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? '#1a73e8' : 'var(--ws-text-muted)' }}>
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* profile pic as last tab */}
      <button onClick={onOpenProfileSettings}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px' }}
      >
        {currentUser?.avatar_url ? (
          <img src={currentUser.avatar_url} alt={currentUser.name}
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            {currentUser?.initials || 'U'}
          </div>
        )}
        <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ws-text-muted)' }}>Me</span>
      </button>
    </div>
  );
}