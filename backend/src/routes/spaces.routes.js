const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const c = require('../controllers/spaces.controller');

router.get(   '/',                          requireAuth,               c.getSpaces);
router.post(  '/',                          requireAuth, requireAdmin, c.createSpace);
router.patch( '/:id/description',           requireAuth, requireAdmin, c.updateDescription);
router.delete('/:id',                       requireAuth, requireAdmin, c.deleteSpace);
router.get(   '/:id/members',               requireAuth,               c.getSpaceMembers);
router.post(  '/:id/members',               requireAuth, requireAdmin, c.addMember);
router.delete('/:id/members/:userId',       requireAuth, requireAdmin, c.removeMember);

module.exports = router;