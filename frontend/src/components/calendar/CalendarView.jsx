import { useState, useEffect } from "react";
import CalendarSidebar from "./CalendarSidebar.jsx";
import CalendarMain from "./CalendarMain.jsx";
import TasksList from "./TasksList.jsx";
import AddTaskModal from "./AddTaskModal.jsx";
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
} from "../../api/calendar.js";

export const indianHolidays = {
  "1-1": "New Year's Day",
  "1-26": "Republic Day",
  "3-14": "Holi",
  "4-14": "Ambedkar Jayanti",
  "5-1": "Labour Day",
  "8-15": "Independence Day",
  "10-2": "Gandhi Jayanti",
  "10-19": "Diwali",
  "12-25": "Christmas Day"
};

// check screen width — same hook pattern used in App.jsx
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function CalendarView({ isSidebarOpen, navSearchQuery }) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode]       = useState("Month");
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    apiGetTasks()
      .then(data => {
        setTasks(data.map(t => ({
          id: t.id, title: t.title, description: t.description,
          date: t.date, time: t.time, completed: t.completed,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddTask = async (newTask) => {
    try {
      const created = await apiCreateTask({
        title: newTask.title, description: newTask.description || null,
        date: newTask.date || null, time: newTask.time || null,
      });
      setTasks(prev => [...prev, {
        id: created.id, title: created.title, description: created.description,
        date: created.date, time: created.time, completed: created.completed,
      }]);
    } catch {}
  };

  const toggleTaskCompletion = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = await apiToggleTask(id, !task.completed);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated.completed } : t));
  };

  const deleteTask = async (id) => {
    try {
      await apiDeleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  // search
  const query = (navSearchQuery || "").toLowerCase().trim();
  let searchResults = null;
  if (query.length > 0) {
    const matchingTasks    = tasks.filter(t => t.title.toLowerCase().includes(query));
    const matchingHolidays = Object.entries(indianHolidays).filter(([_, name]) => name.toLowerCase().includes(query));
    searchResults = (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--ws-bg)', borderBottom: '0.5px solid var(--ws-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxHeight: 300, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px' }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--ws-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Search Results</h3>
          {matchingTasks.length === 0 && matchingHolidays.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ws-text-muted)', margin: 0 }}>No tasks or holidays found.</p>
          )}
          {matchingTasks.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a73e8', margin: '0 0 4px' }}>Tasks</p>
              {matchingTasks.map(t => (
                <div key={t.id} style={{ padding: '4px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ws-text)', cursor: 'pointer', borderRadius: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{t.title}</span>
                  <span style={{ color: 'var(--ws-text-muted)', fontSize: 11 }}>{t.date}</span>
                </div>
              ))}
            </div>
          )}
          {matchingHolidays.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#ea4335', margin: '0 0 4px' }}>Holidays</p>
              {matchingHolidays.map(([key, name]) => {
                const [m, d] = key.split('-');
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                return (
                  <div key={key} style={{ padding: '4px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ws-text)' }}>
                    <span>{name}</span>
                    <span style={{ color: 'var(--ws-text-muted)', fontSize: 11 }}>{monthNames[parseInt(m)-1]} {d}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* back to chat bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--ws-border)', background: 'var(--ws-bg)', flexShrink: 0 }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('calendar:back'))}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ws-text-muted)', fontWeight: 500, padding: '4px 8px', borderRadius: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--ws-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Chat
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {searchResults}

        {/* sidebar: hidden on mobile, shown on desktop */}
        {!isMobile && (
          <CalendarSidebar
            isOpen={isSidebarOpen}
            onAddTask={() => setIsModalOpen(true)}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            indianHolidays={indianHolidays}
            isMobile={false}
          />
        )}

        {viewMode === "Tasks" ? (
          <TasksList
            tasks={tasks}
            loading={loading}
            toggleTaskCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
            onViewCalendar={() => setViewMode("Month")}
          />
        ) : (
          <CalendarMain
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            tasks={tasks}
            indianHolidays={indianHolidays}
            isMobile={isMobile}
            onAddTask={() => setIsModalOpen(true)}
          />
        )}

        {isModalOpen && (
          <AddTaskModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddTask}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}