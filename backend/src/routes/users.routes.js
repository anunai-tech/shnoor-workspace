const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const c = require('../controllers/users.controller');

router.get(   '/',             requireAuth,               c.getUsers);
router.get(   '/admin-all',    requireAuth, requireAdmin, c.getAllUsersAdmin);
router.get(   '/me',           requireAuth,               c.getMe);
router.patch( '/me',           requireAuth,               c.updateMe);
// Legacy base64 avatar (still works for existing uploads)
router.patch( '/me/avatar',    requireAuth,               c.updateAvatar);
// New Cloudinary avatar upload
router.post(  '/me/avatar/upload', requireAuth, c.avatarUploadMiddleware, c.uploadAvatarToCloud);
// Notification / app preferences
router.get(   '/me/preferences', requireAuth,             c.getPreferences);
router.patch( '/me/preferences', requireAuth,             c.updatePreferences);
// Admin actions on other users
router.patch( '/:id/role',     requireAuth, requireAdmin, c.updateUserRole);
router.patch( '/:id/status',   requireAuth, requireAdmin, c.updateUserStatus);

module.exports = router;