const CheckCircleIcon = ({ completed }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={completed ? "#34A853" : "none"} stroke={completed ? "#34A853" : "var(--ws-text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const formatDate = (rawDate) => {
  if (!rawDate) return null;
  const dateOnly = String(rawDate).slice(0, 10);
  const d = new Date(dateOnly + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function TasksList({ tasks, loading, toggleTaskCompletion, deleteTask, onViewCalendar }) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ws-surface)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1a73e8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, background: 'var(--ws-surface)', borderLeft: '0.5px solid var(--ws-border)', overflowY: 'auto' }}>
      {/* header */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--ws-surface)', borderBottom: '0.5px solid var(--ws-border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 400, color: 'var(--ws-text)', margin: 0 }}>My Tasks</h2>
        {onViewCalendar && (
          <button onClick={onViewCalendar} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: '0.5px solid #1a73e8', background: 'none', color: '#1a73e8', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <CalendarIcon />
            View Calendar
          </button>
        )}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {tasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--ws-text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 16 }}>
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--ws-text)', margin: '0 0 6px' }}>No tasks yet</h3>
            <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>Click "Add task" to create one.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...tasks]
              .sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date((a.date || "9999") + "T" + (a.time || "00:00")) -
                       new Date((b.date || "9999") + "T" + (b.time || "00:00"));
              })
              .map(task => (
                <div key={task.id} style={{
                  background: 'var(--ws-bg)', border: `0.5px solid ${task.completed ? 'var(--ws-border)' : 'rgba(26,115,232,0.25)'}`,
                  borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', opacity: task.completed ? 0.6 : 1, transition: 'all 0.15s',
                }}>
                  <button onClick={() => toggleTaskCompletion(task.id)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <CheckCircleIcon completed={task.completed} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 500, color: 'var(--ws-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p style={{ fontSize: 12, color: 'var(--ws-text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>
                    )}
                    {(task.date || task.time) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'var(--ws-text-muted)' }}>
                        {formatDate(task.date) && <span>{formatDate(task.date)}</span>}
                        {formatDate(task.date) && task.time && <span>·</span>}
                        {task.time && <span>{String(task.time).slice(0, 5)}</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteTask(task.id)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', flexShrink: 0, display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,67,53,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}