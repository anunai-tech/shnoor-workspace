import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSpaces from './pages/AdminSpaces';
import AdminContactQueries from './pages/AdminContactQueries';
import AdminSettings from './pages/AdminSettings';
import api from '../api/axios';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  users:     'Users',
  spaces:    'Spaces',
  contact:   'Contact Queries',
  settings:  'Settings',
};

export default function AdminApp({ onBack }) {
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const isMobile  = useIsMobile();

  const [activePage,    setActivePage]    = useState('dashboard');
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [queries,       setQueries]       = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(true);

  useEffect(() => {
    api.get('/api/contact')
      .then(res => setQueries(res.data))
      .catch(err => console.error('Failed to load contact queries:', err))
      .finally(() => setQueriesLoading(false));
  }, []);

  // Close drawer after a page is selected on mobile
  const handleNavigate = (page) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  const renderPage = () => {
    if (activePage === 'dashboard') return <AdminDashboard queries={queries} queriesLoading={queriesLoading} />;
    if (activePage === 'users')     return <AdminUsers />;
    if (activePage === 'spaces')    return <AdminSpaces />;
    if (activePage === 'contact')   return <AdminContactQueries queries={queries} setQueries={setQueries} />;
    if (activePage === 'settings')  return <AdminSettings />;
  };

  const bg          = isDark ? '#111111' : '#F3F4F6';
  const navbarBg    = isDark ? '#0A0A0A' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const textPrimary = isDark ? '#F8FAFC' : '#111827';
  const textMuted   = isDark ? 'rgba(240,240,240,0.55)' : 'rgba(107,114,128,0.8)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      background: bg,
      color: textPrimary,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 56, padding: '0 16px', flexShrink: 0,
          background: navbarBg,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {/* hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 8, color: textPrimary, flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* page title */}
          <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: textPrimary }}>
            {PAGE_LABELS[activePage]}
          </span>

          {/* back to workspace */}
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: textMuted, flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        </div>
      )}

      {/*Body (sidebar + content)*/}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Desktop sidebar — always visible */}
        {!isMobile && (
          <AdminSidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            onBack={onBack}
            queries={queries}
          />
        )}

        {/* Mobile drawer slide-in overlay */}
        {isMobile && drawerOpen && (
          <>
            {/* dim backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(0,0,0,0.45)',
              }}
            />
            {/* drawer panel */}
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
              width: 240,
              animation: 'adminSlideIn 0.22s ease-out',
            }}>
              <AdminSidebar
                activePage={activePage}
                onNavigate={handleNavigate}
                onBack={onBack}
                queries={queries}
                isMobileDrawer
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile ? '16px' : '32px 36px',
        }}>
          {renderPage()}
        </div>
      </div>

      <style>{`
        @keyframes adminSlideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}