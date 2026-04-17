const pool = require('../config/db');

// userId → Set of socketIds — handles the same user having multiple browser tabs open
const onlineUsers = new Map();

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.request.session?.passport?.user;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    console.log(`Socket connected: ${socket.id} (user: ${userId})`);

    // Personal room — used for targeted events like role changes and DM previews.
    // Every socket is always in this room, regardless of which view the user has open.
    socket.join(`user:${userId}`);

    // Track this socket in the online map
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    io.emit('users:online', getOnlineUserIds());

    // Auto-join all existing DM rooms for this user so they receive messages
    // in real time even for DMs they haven't explicitly opened in the current session.
    // New conversations are handled separately via the join_dm event.
    try {
      const convs = await pool.query(
        `SELECT id FROM direct_conversations WHERE user_one_id = $1 OR user_two_id = $1`,
        [userId]
      );
      convs.rows.forEach(({ id }) => socket.join(`dm:${id}`));
    } catch (err) {
      console.error('Failed to auto-join DM rooms:', err);
    }

    socket.on('join_space', (spaceId) => {
      socket.join(`space:${spaceId}`);
    });

    socket.on('leave_space', (spaceId) => {
      socket.leave(`space:${spaceId}`);
    });

    // Client sends the other user's ID — server looks up or creates the conversation
    // and joins this socket to the correct room
    socket.on('join_dm', async (otherUserId) => {
      try {
        const userOne = userId < otherUserId ? userId : otherUserId;
        const userTwo = userId < otherUserId ? otherUserId : userId;

        let conv = await pool.query(
          `SELECT id FROM direct_conversations WHERE user_one_id = $1 AND user_two_id = $2`,
          [userOne, userTwo]
        );

        if (conv.rows.length === 0) {
          conv = await pool.query(
            `INSERT INTO direct_conversations (user_one_id, user_two_id) VALUES ($1, $2) RETURNING id`,
            [userOne, userTwo]
          );
          // New conversation created — join the other user's active sockets to this room too
          // so they immediately receive messages in real time without waiting for next login
          const otherSockets = onlineUsers.get(otherUserId);
          if (otherSockets) {
            otherSockets.forEach((sid) => {
              io.sockets.sockets.get(sid)?.join(`dm:${conv.rows[0].id}`);
            });
          }
        }

        const conversationId = conv.rows[0].id;
        socket.join(`dm:${conversationId}`);
        socket.emit('dm:joined', { conversationId, otherUserId });
      } catch (err) {
        console.error('join_dm error:', err);
      }
    });

    socket.on('leave_dm', (conversationId) => {
      socket.leave(`dm:${conversationId}`);
    });

    // Per-socket typing timers — key is the room string, value is a timeout handle.
    // If typing:stop never arrives (tab closed, crash), this auto-clears after 5 seconds.
    const typingTimers = {};

    socket.on('typing:start', ({ roomType, roomId, userName }) => {
      const room = roomType === 'space' ? `space:${roomId}` : `dm:${roomId}`;

      // Reset the timer — user is still typing
      if (typingTimers[room]) clearTimeout(typingTimers[room]);

      socket.to(room).emit('typing:update', { userId, userName, isTyping: true });

      typingTimers[room] = setTimeout(() => {
        socket.to(room).emit('typing:update', { userId, isTyping: false });
        delete typingTimers[room];
      }, 5000);
    });

    socket.on('typing:stop', ({ roomType, roomId }) => {
      const room = roomType === 'space' ? `space:${roomId}` : `dm:${roomId}`;

      if (typingTimers[room]) {
        clearTimeout(typingTimers[room]);
        delete typingTimers[room];
      }
      socket.to(room).emit('typing:update', { userId, isTyping: false });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Clear any pending typing timers so ghost indicators don't linger
      Object.values(typingTimers).forEach(clearTimeout);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
      io.emit('users:online', getOnlineUserIds());
    });
  });
};

module.exports = socketHandler;