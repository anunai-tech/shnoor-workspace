const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const {
  getSpaces,
  createSpace,
  deleteSpace,
  addMember,
  removeMember,
  getSpaceMembers
} = require('../controllers/spaces.controller');

router.get('/', requireAuth, getSpaces);
router.post('/', requireAdmin, createSpace);
router.delete('/:id', requireAdmin, deleteSpace);
router.get('/:id/members', requireAuth, getSpaceMembers);
router.post('/:id/members', requireAdmin, addMember);
router.delete('/:id/members/:userId', requireAdmin, removeMember);

module.exports = router;