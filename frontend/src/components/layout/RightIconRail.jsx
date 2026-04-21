const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// this whole rail is hidden on mobile via the ws-right-rail CSS class
export default function RightIconRail({ onNavigateToCalendar, className = '' }) {
  return (
    <div className={`ws-right-rail ${className}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, background: '#f8f9fa', borderLeft: '0.5px solid var(--ws-border)', flexShrink: 0, height: '100%' }}>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 12 }}>
        <button
          onClick={onNavigateToCalendar}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer' }}
          title="Open Calendar"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <CalendarIcon />
        </button>
      </div>

      <button
        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', marginTop: 4 }}
        title="Add more"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <PlusIcon />
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ paddingBottom: 12 }}>
        <button
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer' }}
          title="Collapse"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}