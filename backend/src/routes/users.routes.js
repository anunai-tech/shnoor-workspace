const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const {
  getUsers,
  getAllUsersAdmin,
  getMe,
  updateMe,
  updateAvatar,
  updateUserRole,
  updateUserStatus,
} = require('../controllers/users.controller');

// Workspace member list — active users only (no auth restriction beyond session)
router.get('/', requireAuth, getUsers);

// Admin-only: returns all users including deactivated ones, for the admin users page
router.get('/admin-all', requireAuth, requireAdmin, getAllUsersAdmin);

// Current user profile endpoints
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/avatar', requireAuth, updateAvatar);

// Admin-only: manage other users
router.patch('/:id/role', requireAuth, requireAdmin, updateUserRole);
router.patch('/:id/status', requireAuth, requireAdmin, updateUserStatus);

module.exports = router;