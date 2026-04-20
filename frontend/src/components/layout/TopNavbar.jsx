import { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const QuestionIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const AppsIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="var(--ws-text-muted)">
    <circle cx="5" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function useClickOutside(ref, callback) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
}

function HelpDropdown({ onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const tips = [
    'Hover a message to react, edit, or reply',
    'Long press a message on mobile to see actions',
    'Type @ in the message box to mention someone',
    'Use the search bar to find messages',
    'Click your avatar to update your profile',
  ];
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 48, right: 0, zIndex: 50, width: 290,
      background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)',
      borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'fadeSlideDown 0.15s ease-out', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '0.5px solid var(--ws-border)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ws-text)', margin: '0 0 2px' }}>Quick tips</p>
        <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>Getting around SHNOOR Workspace</p>
      </div>
      <div style={{ padding: '8px 0' }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 16px', alignItems: 'flex-start' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0D9488', flexShrink: 0, marginTop: 6 }} />
            <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, lineHeight: 1.5 }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppsDropdown({ onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 48, right: 0, zIndex: 50, width: 220,
      background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)',
      borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'fadeSlideDown 0.15s ease-out', overflow: 'hidden',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px 6px' }}>Apps</p>
      {[{ name: 'Admin Panel', icon: '⭐', desc: 'Manage users and spaces' }, { name: 'Contact Form', icon: '✉️', desc: 'Submit a support request' }].map(app => (
        <button key={app.name} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ fontSize: 18 }}>{app.icon}</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ws-text)', margin: 0 }}>{app.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ws-text-muted)', margin: 0 }}>{app.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ProfileDropdown({ currentUser, onClose, onOpenProfileSettings, onSignOut, isAdmin, onOpenAdmin }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 48, right: 0, zIndex: 50, width: 280,
      background: 'var(--ws-bg)', border: '0.5px solid var(--ws-border)',
      borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
      animation: 'fadeSlideDown 0.15s ease-out', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--ws-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Avatar initials={currentUser.initials} color={currentUser.color} size={40} avatarUrl={currentUser.avatar_url} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</p>
          <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</p>
        </div>
      </div>
      <div style={{ padding: '6px 0' }}>
        <button onClick={() => { onOpenProfileSettings(); onClose(); }} style={{ width: '100%', display: 'block', padding: '9px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--ws-text)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          Profile Settings
        </button>
        
        <button onClick={() => { toggleTheme(); onClose(); }} style={{
          width: '100%', display: 'block', padding: '9px 16px', textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 500, color: 'var(--ws-text)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>

        {/* admin panel accessible from profile menu on mobile too */}
        {isAdmin && (
          <button onClick={() => { onOpenAdmin(); onClose(); }} style={{ width: '100%', display: 'block', padding: '9px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#1a73e8' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ⭐ Admin Panel
          </button>
        )}
        <button onClick={() => { onSignOut?.(); onClose(); }} style={{ width: '100%', display: 'block', padding: '9px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#ef4444' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// status pill is removed — we only show the green online dot on the avatar
export default function TopNavbar({
  onOpenChatSettings, onOpenProfileSettings,
  onToggleSidebar, navSearchQuery, onNavSearchChange,
  onSignOut, currentUser, onOpenAdmin, isAdmin,
  onOpenCalendar, activeView,
  isMobile = false, onMobileBack, mobileChatTitle, showMobileBackBtn = false,
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showHelp, setShowHelp] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const navBtn = {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: isMobile ? 52 : 60,
      padding: isMobile ? '0 12px' : '0 16px',
      borderBottom: `1px solid var(--ws-border)`,
      background: 'var(--ws-navbar)', flexShrink: 0, position: 'relative', zIndex: 20,
    }}>

      {/* left side: back arrow on mobile chat, hamburger on desktop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: isMobile ? 'auto' : 180 }}>
        {isMobile && showMobileBackBtn ? (
          <button onClick={onMobileBack} style={{ ...navBtn, width: 40, height: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : (
          <button style={navBtn} onClick={onToggleSidebar} title="Toggle sidebar"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <HamburgerIcon />
          </button>
        )}

        {isMobile && showMobileBackBtn ? (
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ws-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
            {mobileChatTitle}
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} />
            {!isMobile && <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--ws-text-muted)', letterSpacing: '-0.3px' }}>Chat</span>}
          </div>
        )}
      </div>

      {/* search bar — hidden on mobile */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 600,
            borderRadius: 24, padding: '7px 16px',
            background: searchFocused ? 'var(--ws-bg)' : 'var(--ws-surface-2)',
            border: searchFocused ? '1.5px solid #0D9488' : '1px solid var(--ws-border)',
            transition: 'all 0.2s',
          }}>
            <SearchIcon />
            <input value={navSearchQuery || ''} onChange={e => onNavSearchChange?.(e.target.value)}
              placeholder="Search conversations"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ws-text)' }}
            />
            {navSearchQuery && (
              <button onClick={() => onNavSearchChange?.('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-text-muted)', lineHeight: 1 }}>✕</button>
            )}
          </div>
        </div>
      )}

      {/* right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: isMobile ? 'auto' : 0 }}>

        {/* theme toggle — hidden on mobile */}
        {!isMobile && (
          <button style={navBtn} onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        )}

        {/* help — hidden on mobile */}
        {!isMobile && (
          <div style={{ position: 'relative' }}>
            <button style={navBtn} onClick={() => setShowHelp(p => !p)} title="Help"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <QuestionIcon />
            </button>
            {showHelp && <HelpDropdown onClose={() => setShowHelp(false)} />}
          </div>
        )}

        {/* settings */}
        <button style={navBtn} onClick={onOpenChatSettings} title="Chat settings"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <SettingsIcon />
        </button>

        {/* admin star — desktop only (mobile uses profile dropdown) */}
        {isAdmin && !isMobile && (
          <button style={navBtn} onClick={onOpenAdmin} title="Admin panel"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )}

        {/* apps — desktop only */}
        {!isMobile && (
          <div style={{ position: 'relative' }}>
            <button style={navBtn} onClick={() => setShowApps(p => !p)} title="Apps"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <AppsIcon />
            </button>
            {showApps && <AppsDropdown onClose={() => setShowApps(false)} />}
          </div>
        )}

        {/* profile avatar */}
        <div style={{ position: 'relative', marginLeft: 4 }}>
          <button onClick={() => setShowProfile(p => !p)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
            borderRadius: 24, background: 'none', border: 'none', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ position: 'relative' }}>
              <Avatar initials={currentUser.initials} color={currentUser.color} size={32} avatarUrl={currentUser.avatar_url} />
              {/* green online dot — this is all we need, no status pill */}
              <span style={{
                position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
                borderRadius: '50%', border: '2px solid var(--ws-navbar)', background: '#34A853',
              }} />
            </div>
          </button>
          {showProfile && (
            <ProfileDropdown
              currentUser={currentUser}
              onClose={() => setShowProfile(false)}
              onOpenProfileSettings={onOpenProfileSettings}
              onSignOut={onSignOut}
              isAdmin={isAdmin}
              onOpenAdmin={onOpenAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
}