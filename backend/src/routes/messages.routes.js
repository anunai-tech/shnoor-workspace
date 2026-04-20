const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const c = require('../controllers/messages.controller');

// dm/conversations must come before dm/:userId or Express matches 'conversations' as a userId
router.get('/dm/conversations',              requireAuth, c.getDMConversations);
router.get('/search',                        requireAuth, c.searchMessages);

router.get('/spaces/:id/messages',           requireAuth, c.getSpaceMessages);
router.post('/spaces/:id/messages',          requireAuth, c.sendSpaceMessage);
router.patch('/spaces/:id/messages/:msgId',  requireAuth, c.editSpaceMessage);
router.delete('/spaces/:id/messages/:msgId', requireAuth, c.deleteSpaceMessage);

router.get('/messages/:msgId/thread',        requireAuth, c.getThreadReplies);
router.post('/messages/:msgId/reactions',    requireAuth, c.addReaction);
router.delete('/messages/:msgId/reactions',  requireAuth, c.removeReaction);

router.get('/dm/:userId/messages',           requireAuth, c.getDMMessages);
router.post('/dm/:userId/messages',          requireAuth, c.sendDMMessage);

// DM message edit and delete — look up by message ID directly, no conversation ID needed
router.patch('/dm/messages/:msgId',          requireAuth, c.editDMMessage);
router.delete('/dm/messages/:msgId',         requireAuth, c.deleteDMMessage);

router.post('/upload', requireAuth, c.uploadMiddleware, c.uploadAttachment);

module.exports = router;