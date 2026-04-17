const pool = require('../config/db');

// Returns only active users — used by the workspace member list
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, role, is_active, created_at
       FROM users WHERE is_active = true ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Returns ALL users including inactive — admin panel only
const getAllUsersAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllUsersAdmin error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, role, is_active, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateMe = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name cannot be empty' });
  if (name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, avatar_url, role`,
      [name.trim(), req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;

  if (!avatar) return res.status(400).json({ message: 'Avatar data is required' });
  if (!avatar.startsWith('data:image/')) {
    return res.status(400).json({ message: 'Invalid image format. Must be a data URL.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url, role`,
      [avatar, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateAvatar error:', err);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Role must be admin or member' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, is_active`,
      [role, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });

    // Tell that user's active sessions to refresh their role immediately.
    // Passport's deserializeUser already re-fetches from DB on every request,
    // so req.user is always fresh server-side. This event updates the React state
    // on the frontend so the UI reflects the change without a full re-login.
    req.app.get('io').to(`user:${id}`).emit('user:role_changed', { role });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'is_active must be boolean' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active`,
      [is_active, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateUserStatus error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

module.exports = {
  getUsers,
  getAllUsersAdmin,
  getMe,
  updateMe,
  updateAvatar,
  updateUserRole,
  updateUserStatus,
};