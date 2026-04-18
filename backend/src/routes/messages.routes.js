const router  = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const c = require('../controllers/messages.controller');

// Space messages
router.get( '/spaces/:id/messages',              requireAuth, c.getSpaceMessages);
router.post('/spaces/:id/messages',              requireAuth, c.sendSpaceMessage);
router.patch('/spaces/:id/messages/:msgId',      requireAuth, c.editSpaceMessage);
router.delete('/spaces/:id/messages/:msgId',     requireAuth, c.deleteSpaceMessage);

// Thread replies for a specific message
router.get('/messages/:msgId/thread',            requireAuth, c.getThreadReplies);

// Reactions
router.post(  '/messages/:msgId/reactions',      requireAuth, c.addReaction);
router.delete('/messages/:msgId/reactions',      requireAuth, c.removeReaction);

// DM messages
router.get( '/dm/:userId/messages',              requireAuth, c.getDMMessages);
router.post('/dm/:userId/messages',              requireAuth, c.sendDMMessage);

// DM conversations list with cursor pagination
router.get('/dm/conversations',                  requireAuth, c.getDMConversations);

// Full-text message search
router.get('/search',                            requireAuth, c.searchMessages);

// File attachment upload to Cloudinary
router.post('/upload', requireAuth, c.uploadMiddleware, c.uploadAttachment);

module.exports = router;