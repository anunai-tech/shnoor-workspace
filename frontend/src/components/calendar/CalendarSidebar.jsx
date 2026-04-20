import { useState, useMemo } from "react";

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function CalendarSidebar({ isOpen, onAddTask, currentDate, setCurrentDate, indianHolidays }) {
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    let days = Array.from({ length: firstDay }, () => null);
    for (let i = 1; i <= numDays; i++) days.push(i);
    return days;
  }, [currentDate]);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames   = ["S","M","T","W","T","F","S"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  if (!isOpen) return null;

  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: 'var(--ws-bg)',
      borderRight: '0.5px solid var(--ws-border)',
      height: '100%', display: 'flex', flexDirection: 'column',
      paddingTop: 16, overflowY: 'auto',
    }}>

      {/* add task button */}
      <div style={{ padding: '0 16px 20px' }}>
        <button
          onClick={onAddTask}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 16px',
            background: '#e8f0fe', color: '#1a73e8',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#d2e3fc'}
          onMouseLeave={e => e.currentTarget.style.background = '#e8f0fe'}
        >
          <PlusIcon />
          Add task
        </button>
      </div>

      {/* mini calendar */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ws-text)' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handlePrevMonth} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ChevronLeft />
            </button>
            <button onClick={handleNextMonth} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 2px', textAlign: 'center' }}>
          {dayNames.map((day, i) => (
            <div key={i} style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--ws-text-muted)' }}>
              {day}
            </div>
          ))}
          {daysInMonth.map((date, i) => {
            const isToday = isCurrentMonth && date === today.getDate();
            const holidayKey = date ? `${currentDate.getMonth() + 1}-${date}` : null;
            const holiday    = indianHolidays[holidayKey];
            return (
              <div
                key={i}
                title={holiday || ""}
                onClick={() => date && setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))}
                style={{
                  width: 28, height: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, borderRadius: '50%', cursor: date ? 'pointer' : 'default', margin: '0 auto', position: 'relative',
                  background: isToday ? '#1a73e8' : 'none',
                  color: isToday ? '#fff' : holiday ? '#ea4335' : 'var(--ws-text)',
                  fontWeight: isToday ? 700 : holiday ? 600 : 400,
                }}
                onMouseEnter={e => { if (date && !isToday) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'none'; }}
              >
                {date || ""}
                {holiday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isToday ? '#fff' : '#ea4335', position: 'absolute', bottom: 2 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* upcoming holidays */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
          Upcoming IT Holidays
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(indianHolidays)
            .filter(([key]) => {
              const [m, d] = key.split('-');
              return parseInt(m) > currentDate.getMonth() ||
                (parseInt(m) === currentDate.getMonth() + 1 && parseInt(d) >= currentDate.getDate());
            })
            .slice(0, 3)
            .map(([key, name]) => {
              const [m, d] = key.split('-');
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34A853', flexShrink: 0 }} />
                  <span style={{ color: 'var(--ws-text)', fontWeight: 500 }}>
                    {d} {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]}
                  </span>
                  <span style={{ color: 'var(--ws-text-muted)', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }} title={name}>{name}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}