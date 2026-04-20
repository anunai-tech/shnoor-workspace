import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import AdminApp from './Admin/AdminApp.jsx';
import ProfileSettingsModal from './components/ui/ProfileSettingsModal.jsx';
import ChatSettingsModal from './components/ui/ChatSettingsModal.jsx';
import BottomNav from './components/BottomNav.jsx';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiePolicyPage from './pages/CookiepolicyPage';
import SecurityPage from './pages/SecurityPage';

import TopNavbar from './components/layout/TopNavbar.jsx';
import LeftSidebar from './components/layout/LeftSidebar.jsx';
import ConversationList from './components/layout/ConversationList.jsx';
import ChatArea from './components/layout/ChatArea.jsx';
import RightIconRail from './components/layout/RightIconRail.jsx';
import CalendarView from './components/calendar/CalendarView.jsx';

import { getSpaces, getSpaceMessages, sendSpaceMessage, editSpaceMessage, deleteSpaceMessage, getSpaceMembers } from './api/spaces.js';
import { getAllUsers, getDMMessages, sendDMMessage } from './api/users.js';
import { addReaction, removeReaction, getDMConversations } from './api/messages.js';

// anything under 768px is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function ChatApp({ onSignOut, onOpenAdmin }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const {
    connected,
    joinSpace, leaveSpace, joinDM,
    onNewMessage, onMessageEdited, onMessageDeleted, onReactionUpdated,
    onDMJoined, onTypingUpdate, emitTyping, onlineUsers,
    onDMPreviewUpdated, onUserRoleChanged,
  } = useSocket();

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488',
    avatar_url: user.avatar_url,
  };

  const [spaces, setSpaces]           = useState([]);
  const [allUsers, setAllUsers]       = useState([]);
  const [dmConversations, setDmConversations] = useState([]);
  const [activeSpace, setActiveSpace] = useState(null);
  const [activeDM, setActiveDM]       = useState(null);
  const [activeView, setActiveView]   = useState('home');
  const [messages, setMessages]       = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [spaceMembers, setSpaceMembers] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChatSettings, setShowChatSettings]       = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('active');
  const [isMaximized, setIsMaximized]   = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [typingUsers, setTypingUsers]   = useState([]);
  const [activeDMConversationId, setActiveDMConversationId] = useState(null);

  // mobile nav state - which tab is selected
  // 'home' shows conversation list, 'dms'/'spaces' filter the list
  // 'calendar' opens calendar, 'chat' means a conversation is open
  const [activeMobileTab, setActiveMobileTab] = useState('home');

  // on mobile only one panel shows at a time
  // 'list' = show conversation list, 'chat' = show chat area
  const [mobileScreen, setMobileScreen] = useState('list');

  // calendar back button listener
  useEffect(() => {
    const goBack = () => {
      setActiveView('home');
      setActiveSpace(null);
      setActiveDM(null);
      if (isMobile) setMobileScreen('list');
    };
    window.addEventListener('calendar:back', goBack);
    return () => window.removeEventListener('calendar:back', goBack);
  }, [isMobile]);

  useEffect(() => {
    getSpaces().then(setSpaces).catch(() => showToast('Failed to load spaces', 'error'));
    getAllUsers().then(setAllUsers).catch(() => {});
    getDMConversations().then(setDmConversations).catch(() => {});
  }, []);

  useEffect(() => {
    if (!connected) return;
    return onDMPreviewUpdated(() => {
      getDMConversations().then(setDmConversations).catch(() => {});
    });
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    return onUserRoleChanged(() => refreshUser());
  }, [connected]);

  useEffect(() => {
    if (activeView === 'space' && activeSpace) {
      setMessagesLoading(true);
      getSpaceMessages(activeSpace.id)
        .then(data => { setMessages(data.messages || []); setHasMore(data.hasMore || false); })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
    } else if (activeView === 'dm' && activeDM) {
      setMessagesLoading(true);
      getDMMessages(activeDM.id)
        .then(data => {
          setMessages(data.messages || []);
          setHasMore(data.hasMore || false);
          if (data.conversationId) setActiveDMConversationId(data.conversationId);
        })
        .catch(() => showToast('Failed to load messages', 'error'))
        .finally(() => setMessagesLoading(false));
    } else {
      setMessages([]); setHasMore(false);
    }
  }, [activeSpace, activeDM, activeView]);

  useEffect(() => {
    if (activeView !== 'space' || !activeSpace) return;
    joinSpace(activeSpace.id);
    setTypingUsers([]);
    const cleanups = [
      onNewMessage((msg) => {
        if (msg.space_id !== activeSpace.id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
      }),
      onMessageEdited((msg) => {
        if (msg.space_id !== activeSpace.id) return;
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...formatMsg(msg), reactions: m.reactions } : m));
      }),
      onMessageDeleted(({ messageId, spaceId }) => {
        if (spaceId !== activeSpace.id) return;
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }),
      onReactionUpdated(({ messageId, reactions }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
      }),
      onTypingUpdate(({ userId: uid, userName, isTyping }) => {
        if (uid === user.id) return;
        setTypingUsers(prev => isTyping
          ? (prev.includes(userName) ? prev : [...prev, userName])
          : prev.filter(n => n !== userName));
      }),
    ];
    return () => { leaveSpace(activeSpace.id); cleanups.forEach(fn => fn?.()); };
  }, [activeSpace, activeView]);

  useEffect(() => {
    if (activeView !== 'dm' || !activeDM) return;
    joinDM(activeDM.id);
    setTypingUsers([]);
    const cleanups = [
      onDMJoined(({ conversationId }) => setActiveDMConversationId(conversationId)),
      onNewMessage((msg) => {
        if (!msg.conversation_id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
      }),
      onReactionUpdated(({ messageId, reactions }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
      }),
      onTypingUpdate(({ userId: uid, userName, isTyping }) => {
        if (uid === user.id) return;
        setTypingUsers(prev => isTyping
          ? (prev.includes(userName) ? prev : [...prev, userName])
          : prev.filter(n => n !== userName));
      }),
    ];
    return () => cleanups.forEach(fn => fn?.());
  }, [activeDM, activeView]);

  const formatMsg = (m) => ({
    id: m.id, senderId: m.sender_id, senderName: m.sender_name,
    initials: (m.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', avatar_url: m.avatar_url,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    text: m.content, is_edited: m.is_edited, reactions: m.reactions || [],
  });

  const formattedMessages = messages
    .filter(m => m && (m.content || m.text) && (m.sender_name || m.senderName))
    .map(m => m.senderId ? m : formatMsg(m));

  const formattedSpaces = spaces.map(s => ({
    id: s.id, name: s.name, unread: 0,
    memberCount: s.member_count, members: [],
    last_message: s.last_message, last_message_at: s.last_message_at,
    last_message_sender: s.last_message_sender,
  }));

  const dmUsers = allUsers.filter(u => u.id !== user.id).map(u => ({
    id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url,
    initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', online: onlineUsers.has(u.id),
  }));

  const handleSelectSpace = async (space) => {
    setActiveSpace(space); setActiveDM(null); setActiveView('space');
    setSpaceMembers([]);
    // on mobile open the chat screen right away
    if (isMobile) setMobileScreen('chat');
    try {
      const members = await getSpaceMembers(space.id);
      setSpaceMembers(members);
    } catch { setSpaceMembers([]); }
  };

  const handleSelectDM = (dmUser) => {
    setActiveDM(dmUser); setActiveSpace(null); setActiveView('dm');
    setActiveDMConversationId(null);
    // on mobile open the chat screen right away
    if (isMobile) setMobileScreen('chat');
  };

  // back button handler - on mobile goes back to list, on desktop goes home
  const handleBackToHome = () => {
    setActiveSpace(null); setActiveDM(null);
    setActiveView('home'); setIsMaximized(false);
    setMessages([]); setTypingUsers([]); setSpaceMembers([]);
    if (isMobile) setMobileScreen('list');
  };

  // bottom nav tab change handler
  const handleMobileTabChange = (tab) => {
    setActiveMobileTab(tab);
    if (tab === 'calendar') {
      setActiveView('calendar');
      setMobileScreen('list'); // calendar handles its own full screen
    } else {
      // switching tabs goes back to the list
      setActiveView('home');
      setMobileScreen('list');
      setActiveSpace(null);
      setActiveDM(null);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    try {
      if (activeView === 'space' && activeSpace) await sendSpaceMessage(activeSpace.id, text);
      else if (activeView === 'dm' && activeDM) await sendDMMessage(activeDM.id, text);
    } catch { showToast('Failed to send message', 'error'); }
  };

  const handleEditMessage = async (msgId, content) => {
    if (!activeSpace) return;
    try {
      await editSpaceMessage(activeSpace.id, msgId, content);
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, text: content, is_edited: true } : m
      ));
    } catch (err) {
      showToast('Failed to edit message', 'error');
      throw err;
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!activeSpace) return;
    try {
      await deleteSpaceMessage(activeSpace.id, msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { showToast('Failed to delete message', 'error'); }
  };

  const handleAddReaction = async (msgId, emoji) => {
    try {
      const result = await addReaction(msgId, emoji);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
    } catch { showToast('Failed to add reaction', 'error'); }
  };

  const handleRemoveReaction = async (msgId, emoji) => {
    try {
      const result = await removeReaction(msgId, emoji);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: result.reactions } : m));
    } catch { showToast('Failed to remove reaction', 'error'); }
  };

  const handleLoadMore = async () => {
    const oldest = messages[0];
    if (!oldest) return;
    try {
      let data;
      if (activeView === 'space' && activeSpace) data = await getSpaceMessages(activeSpace.id, oldest.created_at || oldest.time);
      else if (activeView === 'dm' && activeDM)   data = await getDMMessages(activeDM.id, oldest.created_at);
      if (data?.messages) { setMessages(prev => [...data.messages.map(formatMsg), ...prev]); setHasMore(data.hasMore || false); }
    } catch { showToast('Failed to load more messages', 'error'); }
  };

  const handleTypingChange = (isTyping) => {
    if (activeView === 'space' && activeSpace) emitTyping('space', activeSpace.id, user.name, isTyping);
    else if (activeView === 'dm' && activeDMConversationId) emitTyping('dm', activeDMConversationId, user.name, isTyping);
  };

  const chatTitle   = activeView === 'space' && activeSpace ? activeSpace.name : activeDM?.name || '';
  const memberCount = activeView === 'space' && activeSpace ? activeSpace.memberCount : null;

  // on mobile figure out what to show
  // mobileScreen = 'chat' means user tapped a conversation
  // mobileScreen = 'list' means show the conversation list
  const showMobileChatScreen = isMobile && mobileScreen === 'chat';
  const showMobileListScreen = isMobile && mobileScreen === 'list';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white"
      style={{ paddingBottom: isMobile ? 60 : 0 }}>

      <TopNavbar
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
        onOpenChatSettings={() => setShowChatSettings(true)}
        onOpenProfileSettings={() => setShowProfileSettings(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        navSearchQuery={navSearchQuery}
        onNavSearchChange={setNavSearchQuery}
        onSignOut={onSignOut}
        currentUser={currentUser}
        onOpenAdmin={onOpenAdmin}
        isAdmin={user.role === 'admin'}
        onOpenCalendar={() => setActiveView('calendar')}
        onOpenChat={() => { setActiveSpace(null); setActiveDM(null); setActiveView('home'); }}
        activeView={activeView}
        isMobile={isMobile}
        onMobileBack={handleBackToHome}
        mobileChatTitle={chatTitle}
        showMobileBackBtn={showMobileChatScreen}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* left sidebar hidden on mobile via CSS class */}
        {!isMobile && activeView !== 'calendar' && (
          <LeftSidebar
            className="ws-left-sidebar"
            isOpen={isSidebarOpen}
            onSelectSpace={handleSelectSpace}
            onSelectDM={handleSelectDM}
            activeSpace={activeSpace}
            activeDM={activeDM}
            activeView={activeView}
            onHomeClick={handleBackToHome}
            onMentionsClick={() => { setActiveSpace(null); setActiveDM(null); setActiveView('mentions'); setIsMaximized(false); }}
            onCreateSpace={() => {}}
            allSpaces={formattedSpaces}
            currentUser={currentUser}
            dmUsers={dmUsers}
          />
        )}

        {activeView === 'calendar' ? (
          <CalendarView isSidebarOpen={isSidebarOpen} navSearchQuery={navSearchQuery} />
        ) : (
          <>
            {/* on desktop always show both, on mobile show only one at a time */}
            {(!isMobile || showMobileListScreen) && !isMaximized && (
              <ConversationList
                className="ws-conversation-list"
                activeView={activeView}
                onSelectConversation={(item) => {
                  if (item.type === 'space') { const s = formattedSpaces.find(s => s.id === item.id); if (s) handleSelectSpace(s); }
                  else { const d = dmUsers.find(d => d.id === item.id); if (d) handleSelectDM(d); }
                }}
                selectedId={activeSpace?.id || activeDM?.id}
                navSearchQuery={navSearchQuery}
                mentionedMessages={[]}
                allSpaces={formattedSpaces}
                dmConversations={dmConversations}
                currentUserId={user.id}
                isMobile={isMobile}
                activeMobileTab={activeMobileTab}
              />
            )}

            {/* only show chat area on mobile when user tapped a conversation */}
            {(!isMobile || showMobileChatScreen) && (
              <ChatArea
                className="ws-chat-area"
                title={chatTitle}
                memberCount={memberCount}
                messages={messagesLoading ? [] : formattedMessages}
                onSend={handleSendMessage}
                isSpace={activeView === 'space'}
                activeView={activeView}
                onClose={handleBackToHome}
                isMaximized={isMaximized}
                onToggleMaximize={() => setIsMaximized(prev => !prev)}
                spaceMembers={spaceMembers}
                currentUserId={user.id}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                typingUsers={typingUsers}
                messagesLoading={messagesLoading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onTypingChange={handleTypingChange}
                spaceId={activeSpace?.id}
                isMobile={isMobile}
              />
            )}
          </>
        )}

        {/* right rail hidden on mobile */}
        {!isMobile && activeView !== 'calendar' && (
          <RightIconRail
            className="ws-right-rail"
            onNavigateToCalendar={() => setActiveView('calendar')}
          />
        )}
      </div>

      {/* bottom nav only shows on mobile */}
      {isMobile && (
        <BottomNav
          activeMobileTab={activeMobileTab}
          onTabChange={handleMobileTabChange}
          currentUser={currentUser}
          onOpenProfileSettings={() => setShowProfileSettings(true)}
        />
      )}

      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
      {showChatSettings    && <ChatSettingsModal    onClose={() => setShowChatSettings(false)} />}
    </div>
  );
}

function WorkspaceRoot({ user, onSignOut }) {
  const [inAdmin, setInAdmin] = useState(false);
  if (inAdmin && user.role === 'admin') return <AdminApp onBack={() => setInAdmin(false)} />;
  return <ChatApp onSignOut={onSignOut} onOpenAdmin={() => setInAdmin(true)} />;
}

function AppRouter() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('landing');
  const navigate = (to) => { setPage(to); window.scrollTo({ top: 0 }); };
  const handleSignOut = async () => { await logout(); navigate('landing'); };

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, padding: 6 }}>
          <img src="/shnoor-logo.png" alt="SHNOOR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>
    );
  }

  if (user) return <WorkspaceRoot user={user} onSignOut={handleSignOut} />;
  if (page === 'login')    return <LoginPage    onNavigate={navigate} />;
  if (page === 'privacy')  return <PrivacyPolicyPage onNavigate={navigate} />;
  if (page === 'terms')    return <TermsPage    onNavigate={navigate} />;
  if (page === 'cookie')   return <CookiePolicyPage onNavigate={navigate} />;
  if (page === 'security') return <SecurityPage onNavigate={navigate} />;
  return <LandingPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}