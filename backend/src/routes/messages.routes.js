const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const {
  getSpaceMessages, sendSpaceMessage, editSpaceMessage, deleteSpaceMessage,
  addReaction, removeReaction, searchMessages,
  getDMMessages, sendDMMessage, getDMConversations,
} = require('../controllers/messages.controller');

// Must be before /dm/:userId/messages to avoid 'conversations' being treated as userId
router.get('/dm/conversations', requireAuth, getDMConversations);

router.get('/search', requireAuth, searchMessages);

router.get('/spaces/:id/messages', requireAuth, getSpaceMessages);
router.post('/spaces/:id/messages', requireAuth, sendSpaceMessage);
router.patch('/spaces/:id/messages/:msgId', requireAuth, editSpaceMessage);
router.delete('/spaces/:id/messages/:msgId', requireAuth, deleteSpaceMessage);

router.post('/messages/:msgId/reactions', requireAuth, addReaction);
router.delete('/messages/:msgId/reactions', requireAuth, removeReaction);

router.get('/dm/:userId/messages', requireAuth, getDMMessages);
router.post('/dm/:userId/messages', requireAuth, sendDMMessage);

module.exports = router;