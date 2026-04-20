import { useState } from "react";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function AddTaskModal({ onClose, onSave, isMobile = false }) {
  const [taskName, setTaskName] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");

  const handleSave = () => {
    if (taskName.trim()) {
      onSave({ title: taskName, date: taskDate, time: taskTime, id: Date.now() });
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s',
    }}>
      {/* modal card — on mobile: full width slide-up sheet with fixed height so save button always shows */}
      <div style={{
        background: 'var(--ws-bg)',
        borderRadius: isMobile ? '16px 16px 0 0' : 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        width: isMobile ? '100%' : 420,
        // on mobile: fixed layout so header + fields + footer all fit without scrolling
        display: 'flex',
        flexDirection: 'column',
        maxHeight: isMobile ? '90vh' : 'auto',
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0,
      }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-surface)', borderRadius: isMobile ? '16px 16px 0 0' : '12px 12px 0 0', flexShrink: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ws-text)', margin: 0 }}>Add task</h3>
          <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: 'var(--ws-text-muted)', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <CloseIcon />
          </button>
        </div>

        {/* fields — scrollable if content overflows */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ws-text-muted)', marginBottom: 6 }}>Task Name</label>
            <input
              value={taskName} onChange={e => setTaskName(e.target.value)}
              placeholder="e.g., Update project docs"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 8, fontSize: isMobile ? 16 : 14, background: 'var(--ws-input-bg)', color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1a73e8'}
              onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ws-text-muted)', marginBottom: 6 }}>Date</label>
              <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 8, fontSize: isMobile ? 16 : 14, background: 'var(--ws-input-bg)', color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1a73e8'}
                onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ws-text-muted)', marginBottom: 6 }}>Time</label>
              <input type="time" value={taskTime} onChange={e => setTaskTime(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 8, fontSize: isMobile ? 16 : 14, background: 'var(--ws-input-bg)', color: 'var(--ws-text)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1a73e8'}
                onBlur={e => e.target.style.borderColor = 'var(--ws-border)'}
              />
            </div>
          </div>
        </div>

        {/* footer — flexShrink: 0 so Save button is ALWAYS visible, never pushed off screen */}
        <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--ws-border)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--ws-surface)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--ws-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={!taskName.trim()}
            style={{ padding: '9px 18px', borderRadius: 6, background: taskName.trim() ? '#1a73e8' : 'var(--ws-surface-2)', color: taskName.trim() ? '#fff' : 'var(--ws-text-muted)', border: 'none', cursor: taskName.trim() ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, minWidth: 90 }}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}