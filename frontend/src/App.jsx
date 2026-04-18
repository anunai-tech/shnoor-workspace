import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import AdminApp from './Admin/AdminApp.jsx';
import ProfileSettingsModal from './components/ui/ProfileSettingsModal.jsx';
import ChatSettingsModal from './components/ui/ChatSettingsModal.jsx';

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

import { getSpaces, getSpaceMessages, sendSpaceMessage, editSpaceMessage, deleteSpaceMessage } from './api/spaces.js';
import { getAllUsers, getDMMessages, sendDMMessage } from './api/users.js';
import { addReaction, removeReaction, getDMConversations, searchMessages } from './api/messages.js';

// Request browser notification permission once on login — without this desktop
// notifications simply never appear
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showDesktopNotification(title, body, icon = '/shnoor-logo.png') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!document.hidden) return; // don't notify when the tab is already focused
  try {
    const n = new Notification(title, { body, icon, silent: false });
    setTimeout(() => n.close(), 6000);
  } catch {}
}

function ChatApp({ onSignOut, onOpenAdmin, onGoToContact }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const {
    connected,
    joinSpace, leaveSpace, joinDM,
    onNewMessage, onMessageEdited, onMessageDeleted, onReactionUpdated,
    onDMJoined, onTypingUpdate, emitTyping, onlineUsers,
    onDMPreviewUpdated, onUserRoleChanged,
  } = useSocket();

  const currentUser = {
    id: user.id, name: user.name, email: user.email,
    initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', avatar_url: user.avatar_url,
    preferences: user.preferences || {},
  };

  const [spaces, setSpaces] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [dmConversations, setDmConversations] = useState([]);
  const [dmHasMore, setDmHasMore] = useState(false);
  const [dmCursor, setDmCursor] = useState(null);
  const [dmLoadingMore, setDmLoadingMore] = useState(false);
  const [activeSpace, setActiveSpace] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [activeView, setActiveView] = useState('home');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('active');
  const [isMaximized, setIsMaximized] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeDMConversationId, setActiveDMConversationId] = useState(null);
  const [mentionedMessages, setMentionedMessages] = useState([]);
  // unreadCounts: key = spaceId or `dm:${userId}`, value = unread count
  const [unreadCounts, setUnreadCounts] = useState({});
  // Total unread for document title badge
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // Update browser tab title when unread count changes
  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) SHNOOR Chat` : 'SHNOOR Chat';
  }, [totalUnread]);

  // Stamp dark mode on html element so CSS vars kick in for the workspace
  useEffect(() => {
    document.documentElement.classList.toggle('chat-mode', true);
    return () => document.documentElement.classList.remove('chat-mode');
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    getSpaces().then(setSpaces).catch(() => showToast('Failed to load spaces', 'error'));
    getAllUsers().then(setAllUsers).catch(() => {});
    loadDMConversations();
  }, []);

  const loadDMConversations = async (cursor = null) => {
    try {
      const data = await getDMConversations(cursor);
      if (cursor) {
        setDmConversations(prev => [...prev, ...data.conversations]);
      } else {
        setDmConversations(data.conversations || []);
      }
      setDmHasMore(data.hasMore || false);
      if (data.conversations?.length) {
        setDmCursor(data.conversations[data.conversations.length - 1].last_message_at);
      }
    } catch {}
  };

  const handleLoadMoreDMs = async () => {
    if (dmLoadingMore || !dmHasMore) return;
    setDmLoadingMore(true);
    await loadDMConversations(dmCursor);
    setDmLoadingMore(false);
  };

  // Global DM preview listener
  useEffect(() => {
    if (!connected) return;
    return onDMPreviewUpdated(() => loadDMConversations());
  }, [connected]);

  // Global role-change listener
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

  // Space socket listeners
  useEffect(() => {
    if (activeView !== 'space' || !activeSpace) return;
    joinSpace(activeSpace.id);
    setTypingUsers([]);
    // Clear unread for this space now that we've opened it
    setUnreadCounts(prev => { const next = { ...prev }; delete next[activeSpace.id]; return next; });

    const cleanups = [
      onNewMessage((msg) => {
        if (msg.space_id !== activeSpace.id) {
          // Message arrived in a space we're NOT viewing — increment its badge
          setUnreadCounts(prev => ({ ...prev, [msg.space_id]: (prev[msg.space_id] || 0) + 1 }));
          showDesktopNotification(`#${msg.space_name || 'space'}`, `${msg.sender_name}: ${msg.content}`);
          // Capture @mentions directed at current user
          if (msg.content?.toLowerCase().includes(`@${user.name.toLowerCase()}`)) {
            setMentionedMessages(prev => [{
              id: msg.id, senderName: msg.sender_name, text: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              sourceType: 'space', sourceId: msg.space_id, source: msg.space_name || 'a space',
            }, ...prev].slice(0, 100));
          }
          return;
        }
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

  // DM socket listeners
  useEffect(() => {
    if (activeView !== 'dm' || !activeDM) return;
    joinDM(activeDM.id);
    setTypingUsers([]);
    // Clear unread for this DM
    setUnreadCounts(prev => { const next = { ...prev }; delete next[`dm:${activeDM.id}`]; return next; });

    const cleanups = [
      onDMJoined(({ conversationId }) => setActiveDMConversationId(conversationId)),
      onNewMessage((msg) => {
        if (!msg.conversation_id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, formatMsg(msg)]);
        // If this DM is not the active one, bump its unread count
        if (msg.sender_id !== user.id) {
          showDesktopNotification(msg.sender_name, msg.content);
        }
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

  // When any DM message arrives for a conversation the user is NOT currently viewing
  useEffect(() => {
    if (!connected) return;
    return onNewMessage((msg) => {
      if (!msg.conversation_id) return;
      // Find which user this DM is with
      const conv = dmConversations.find(c => c.conversation_id === msg.conversation_id);
      if (!conv) return;
      if (activeView === 'dm' && activeDM?.id === conv.other_user_id) return; // already viewing
      if (msg.sender_id === user.id) return; // own message
      setUnreadCounts(prev => ({
        ...prev,
        [`dm:${conv.other_user_id}`]: (prev[`dm:${conv.other_user_id}`] || 0) + 1,
      }));
    });
  }, [connected, dmConversations, activeView, activeDM]);

  const formatMsg = (m) => ({
    id: m.id, senderId: m.sender_id, senderName: m.sender_name,
    initials: (m.sender_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', avatar_url: m.avatar_url,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    text: m.content, is_edited: m.is_edited, reactions: m.reactions || [],
    attachments: m.attachments || [],
    parentContent: m.parent_content, parentSenderName: m.parent_sender_name,
    parentMessageId: m.parent_message_id, replyCount: m.reply_count || 0,
  });

  const formattedMessages = messages
    .filter(m => m && (m.content || m.text || m.attachments?.length) && (m.sender_name || m.senderName))
    .map(m => m.senderId ? m : formatMsg(m));

  const formattedSpaces = spaces.map(s => ({
    id: s.id, name: s.name, description: s.description, unread: unreadCounts[s.id] || 0,
    memberCount: s.member_count, members: [],
    last_message: s.last_message, last_message_at: s.last_message_at,
    last_message_sender: s.last_message_sender,
  }));

  const dmUsers = allUsers.filter(u => u.id !== user.id).map(u => ({
    id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url,
    initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: '#0D9488', online: onlineUsers.has(u.id),
    unread: unreadCounts[`dm:${u.id}`] || 0,
  }));

  const handleSelectSpace = (space) => {
    setActiveSpace(space); setActiveDM(null); setActiveView('space');
    setUnreadCounts(prev => { const n = { ...prev }; delete n[space.id]; return n; });
  };

  const handleSelectDM = (dmUser) => {
    setActiveDM(dmUser); setActiveSpace(null); setActiveView('dm');
    setActiveDMConversationId(null);
    setUnreadCounts(prev => { const n = { ...prev }; delete n[`dm:${dmUser.id}`]; return n; });
  };

  const handleBackToHome = () => {
    setActiveSpace(null); setActiveDM(null);
    setActiveView('home'); setIsMaximized(false); setMessages([]); setTypingUsers([]);
  };

  const handleSendMessage = async (text, parentMessageId = null, attachments = []) => {
    if (!text.trim() && !attachments.length) return;
    try {
      if (activeView === 'space' && activeSpace) {
        await sendSpaceMessage(activeSpace.id, text, parentMessageId, attachments);
      } else if (activeView === 'dm' && activeDM) {
        await sendDMMessage(activeDM.id, text, parentMessageId, attachments);
        loadDMConversations();
      }
    } catch { showToast('Failed to send message', 'error'); }
  };

  const handleEditMessage = async (msgId, content) => {
    if (!activeSpace) return;
    try { await editSpaceMessage(activeSpace.id, msgId, content); }
    catch { showToast('Failed to edit message', 'error'); }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!activeSpace) return;
    try { await deleteSpaceMessage(activeSpace.id, msgId); }
    catch { showToast('Failed to delete message', 'error'); }
  };

  const handleAddReaction    = async (msgId, emoji) => {
    try { const r = await addReaction(msgId, emoji); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: r.reactions } : m)); }
    catch { showToast('Failed to add reaction', 'error'); }
  };

  const handleRemoveReaction = async (msgId, emoji) => {
    try { const r = await removeReaction(msgId, emoji); setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: r.reactions } : m)); }
    catch { showToast('Failed to remove reaction', 'error'); }
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

  const chatTitle      = activeView === 'space' && activeSpace ? activeSpace.name : activeDM?.name || '';
  const chatDesc       = activeView === 'space' && activeSpace ? (activeSpace.description || '') : '';
  const memberCount    = activeView === 'space' && activeSpace ? activeSpace.memberCount : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--ws-bg)', color: 'var(--ws-text)' }}>
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
        onGoToContact={onGoToContact}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Mobile sidebar overlay */}
        <div
          className={`ws-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <LeftSidebar
          className={`ws-sidebar ${isSidebarOpen ? 'open' : ''}`}
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
          onLoadMoreDMs={handleLoadMoreDMs}
          dmHasMore={dmHasMore}
          dmLoadingMore={dmLoadingMore}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
        {!isMaximized && (
          <ConversationList
            className="ws-conversation-list"
            activeView={activeView}
            onSelectConversation={(item) => {
              if (item.type === 'space') { const s = formattedSpaces.find(s => s.id === item.id); if (s) handleSelectSpace(s); }
              else { const d = dmUsers.find(d => d.id === item.id); if (d) handleSelectDM(d); }
            }}
            selectedId={activeSpace?.id || activeDM?.id}
            navSearchQuery={navSearchQuery}
            mentionedMessages={mentionedMessages}
            allSpaces={formattedSpaces}
            dmConversations={dmConversations}
            currentUserId={user.id}
          />
        )}
        <ChatArea
          title={chatTitle}
          description={chatDesc}
          memberCount={memberCount}
          messages={messagesLoading ? [] : formattedMessages}
          onSend={handleSendMessage}
          isSpace={activeView === 'space'}
          activeView={activeView}
          onClose={handleBackToHome}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(prev => !prev)}
          spaceMembers={activeSpace?.members || []}
          currentUserId={user.id}
          currentUser={currentUser}
          allUsers={dmUsers}
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
        />
        <RightIconRail className="ws-right-rail" />
      </div>

      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
      {showChatSettings    && <ChatSettingsModal    onClose={() => setShowChatSettings(false)} currentUser={currentUser} />}
    </div>
  );
}

function WorkspaceRoot({ user, onSignOut, onGoToContact }) {
  const [inAdmin, setInAdmin] = useState(false);
  if (inAdmin && user.role === 'admin') return <AdminApp onBack={() => setInAdmin(false)} />;
  return <ChatApp onSignOut={onSignOut} onOpenAdmin={() => setInAdmin(true)} onGoToContact={onGoToContact} />;
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

  if (user) {
    // onGoToContact: navigate to landing page contact section
    const goToContact = () => navigate('landing-contact');
    return <WorkspaceRoot user={user} onSignOut={handleSignOut} onGoToContact={goToContact} />;
  }

  if (page === 'landing-contact') return <LandingPage onNavigate={navigate} scrollToContact />;
  if (page === 'login')    return <LoginPage onNavigate={navigate} />;
  if (page === 'privacy')  return <PrivacyPolicyPage onNavigate={navigate} />;
  if (page === 'terms')    return <TermsPage onNavigate={navigate} />;
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