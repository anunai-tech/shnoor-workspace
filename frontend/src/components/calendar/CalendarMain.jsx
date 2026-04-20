import { useState, useEffect } from "react";

export default function CalendarMain({
  viewMode, onViewModeChange, currentDate, setCurrentDate,
  tasks, indianHolidays, isMobile = false, onAddTask,
}) {

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "Day") d.setDate(d.getDate() - 1);
    if (viewMode === "Week") d.setDate(d.getDate() - 7);
    if (viewMode === "Month") d.setMonth(d.getMonth() - 1);
    if (viewMode === "Year") d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };
  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "Day") d.setDate(d.getDate() + 1);
    if (viewMode === "Week") d.setDate(d.getDate() + 7);
    if (viewMode === "Month") d.setMonth(d.getMonth() + 1);
    if (viewMode === "Year") d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };
  const handleToday = () => setCurrentDate(new Date());

  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "";
    const ampm = i < 12 ? "AM" : "PM";
    const hr = i % 12 || 12;
    return `${hr} ${ampm}`;
  });

  const getMonthName = (date) => ["January","February","March","April","May","June","July","August","September","October","November","December"][date.getMonth()];
  const getDayName = (date) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const normDate = (s) => (s ? String(s).slice(0, 10) : '');
  const calculateTop = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  };

  const CurrentTimeLine = () => {
    const top = (currentTime.getHours() * 60) + currentTime.getMinutes();
    return (
      <div style={{ position: 'absolute', width: '100%', display: 'flex', alignItems: 'center', zIndex: 30, pointerEvents: 'none', top: `${top}px` }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ea4335', marginLeft: -6 }} />
        <div style={{ height: 2, flex: 1, background: '#ea4335' }} />
      </div>
    );
  };

  const renderDayView = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--ws-border)' }}>
        <div style={{ width: 60, borderRight: '0.5px solid var(--ws-border)', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: '0.5px solid var(--ws-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{getDayName(currentDate)}</div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a73e8', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            {currentDate.getDate()}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 60, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            {hours.map((hour, i) => (
              <div key={i} style={{ height: 60, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 10, color: 'var(--ws-text-muted)' }}>{hour}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, position: 'relative', borderLeft: '0.5px solid var(--ws-border)' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ height: 60, borderBottom: `0.5px solid var(--ws-border)` }} />
            ))}
            {currentDate.toDateString() === new Date().toDateString() && <CurrentTimeLine />}
            {tasks.filter(t => normDate(t.date) === toLocalDateStr(currentDate)).map((task, idx) => (
              <div key={idx} style={{ position: 'absolute', left: 8, right: 16, height: 56, top: calculateTop(task.time), background: '#e8f0fe', borderLeft: '4px solid #1a73e8', borderRadius: 6, padding: 8, overflow: 'hidden', zIndex: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a73e8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                <span style={{ fontSize: 10, color: '#1a73e8', opacity: 0.8 }}>{task.time ? task.time.slice(0, 5) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '0.5px solid var(--ws-border)' }}>
          <div style={{ width: 60, borderRight: '0.5px solid var(--ws-border)', flexShrink: 0 }} />
          {weekDays.map((date, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRight: '0.5px solid var(--ws-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{getDayName(date).substring(0, 1)}</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: date.toDateString() === new Date().toDateString() ? '#1a73e8' : 'none', color: date.toDateString() === new Date().toDateString() ? '#fff' : 'var(--ws-text)' }}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: 60, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {hours.map((hour, i) => (
                <div key={i} style={{ height: 60, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 10, color: 'var(--ws-text-muted)' }}>{hour}</span>
                </div>
              ))}
            </div>
            {weekDays.map((date, dayIdx) => (
              <div key={dayIdx} style={{ flex: 1, position: 'relative', borderLeft: '0.5px solid var(--ws-border)' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} style={{ height: 60, borderBottom: '0.5px solid var(--ws-border)' }} />
                ))}
                {date.toDateString() === new Date().toDateString() && <CurrentTimeLine />}
                {tasks.filter(t => normDate(t.date) === toLocalDateStr(date)).map((task, idx) => (
                  <div key={idx} style={{ position: 'absolute', left: 2, right: 2, height: 40, top: calculateTop(task.time), background: '#e8f0fe', borderLeft: '3px solid #1a73e8', borderRadius: 4, padding: 4, overflow: 'hidden', zIndex: 20 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#1a73e8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    let days = Array.from({ length: firstDay }, () => null);
    for (let i = 1; i <= numDays; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--ws-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '0.5px solid var(--ws-border)', background: 'var(--ws-bg)' }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
            <div key={day} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--ws-text-muted)', textTransform: 'uppercase', borderRight: '0.5px solid var(--ws-border)' }}>
              {isMobile ? day[0] : day}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${days.length / 7}, 1fr)`, overflow: 'hidden' }}>
          {days.map((day, i) => {
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const holiday = day ? indianHolidays[`${month + 1}-${day}`] : null;
            const dayTasks = day ? tasks.filter(t => {
              const d = new Date(t.date);
              return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            }) : [];
            return (
              <div key={i} style={{ borderRight: '0.5px solid var(--ws-border)', borderBottom: '0.5px solid var(--ws-border)', padding: 4, minHeight: isMobile ? 60 : 80, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--ws-bg)'}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                  <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: 12, fontWeight: 500, marginTop: 4, background: isToday ? '#1a73e8' : 'none', color: isToday ? '#fff' : 'var(--ws-text)' }}>
                    {day || ""}
                  </div>
                </div>
                {day && !isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                    {holiday && (
                      <div style={{ background: '#fce8e6', color: '#ea4335', fontSize: 10, padding: '1px 6px', borderRadius: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={holiday}>
                        {holiday}
                      </div>
                    )}
                    {dayTasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e8f0fe', color: '#1a73e8', fontSize: 10, padding: '1px 6px', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a73e8', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {day && isMobile && (holiday || dayTasks.length > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {holiday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ea4335' }} />}
                    {dayTasks.length > 0 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a73e8' }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 32, background: 'var(--ws-bg)', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 16 : 32 }}>
        {months.map((monthDate, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: '#1a73e8', marginBottom: 10, textAlign: 'center' }}>{getMonthName(monthDate)}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 1px', textAlign: 'center' }}>
              {["S","M","T","W","T","F","S"].map((d, j) => (
                <div key={j} style={{ fontSize: 10, fontWeight: 500, color: 'var(--ws-text-muted)', marginBottom: 4, height: 16 }}>{d}</div>
              ))}
              {(() => {
                const numDays = new Date(year, i + 1, 0).getDate();
                const firstDay = new Date(year, i, 1).getDay();
                let days = Array.from({ length: firstDay }, () => null);
                for (let k = 1; k <= numDays; k++) days.push(k);
                return days.map((date, idx) => {
                  const isToday = date === new Date().getDate() && i === new Date().getMonth() && year === new Date().getFullYear();
                  const hasTask = date && tasks.some(t => {
                    const d = new Date(normDate(t.date) + 'T00:00:00');
                    return d.getDate() === date && d.getMonth() === i && d.getFullYear() === year;
                  });
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: 11, cursor: date ? 'pointer' : 'default', background: isToday ? '#1a73e8' : 'none', color: isToday ? '#fff' : 'var(--ws-text)', fontWeight: isToday ? 700 : 400 }}
                        onMouseEnter={e => { if (!isToday && date) e.currentTarget.style.background = 'var(--ws-hover)'; }}
                        onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'none'; }}
                      >
                        {date || ''}
                      </div>
                      {hasTask && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a73e8', marginTop: 1 }} />}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // on mobile only show Month, Tasks (hide Day/Week/Year to save space)
  const VIEW_MODES = isMobile ? ["Month", "Tasks"] : ["Day", "Week", "Month", "Year", "Tasks"];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ws-bg)', overflow: 'hidden' }}>

      {/* action bar */}
      <div style={{ height: isMobile ? 44 : 52, padding: isMobile ? '0 10px' : '0 16px', borderBottom: '0.5px solid var(--ws-border)', display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, background: 'var(--ws-bg)', flexShrink: 0, zIndex: 10 }}>
        <button onClick={handleToday} style={{ padding: isMobile ? '4px 8px' : '5px 12px', border: '0.5px solid var(--ws-border)', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: isMobile ? 11 : 13, fontWeight: 500, color: 'var(--ws-text)', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          Today
        </button>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button onClick={handlePrev} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={handleNext} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: 'var(--ws-text-muted)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <h2 style={{ fontSize: isMobile ? 14 : 18, fontWeight: 400, color: 'var(--ws-text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {viewMode === "Day" && `${getMonthName(currentDate)} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          {viewMode === "Week" && `${getMonthName(currentDate)} ${currentDate.getFullYear()}`}
          {viewMode === "Month" && `${getMonthName(currentDate)} ${currentDate.getFullYear()}`}
          {viewMode === "Year" && `${currentDate.getFullYear()}`}
          {viewMode === "Tasks" && 'Tasks'}
        </h2>

        {/* on mobile: add task button here since sidebar is hidden */}
        {isMobile && (
          <button onClick={onAddTask} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        )}

        {/* view mode switcher */}
        <div style={{ display: 'flex', border: '0.5px solid var(--ws-border)', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          {VIEW_MODES.map((mode, idx) => (
            <button key={mode} onClick={() => onViewModeChange?.(mode)}
              style={{
                padding: isMobile ? '4px 8px' : '5px 12px', fontSize: isMobile ? 11 : 12, fontWeight: 500,
                background: viewMode === mode ? '#1a73e8' : 'var(--ws-bg)',
                color: viewMode === mode ? '#fff' : 'var(--ws-text)',
                border: 'none', borderLeft: idx !== 0 ? '0.5px solid var(--ws-border)' : 'none',
                cursor: 'pointer', transition: 'all 0.1s',
              }}
              onMouseEnter={e => { if (viewMode !== mode) e.currentTarget.style.background = 'var(--ws-hover)'; }}
              onMouseLeave={e => { if (viewMode !== mode) e.currentTarget.style.background = 'var(--ws-bg)'; }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "Day"   && renderDayView()}
      {viewMode === "Week"  && renderWeekView()}
      {viewMode === "Month" && renderMonthView()}
      {viewMode === "Year"  && renderYearView()}
    </div>
  );
}