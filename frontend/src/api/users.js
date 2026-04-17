import api from './axios';

// Workspace member list — active users only
export const getAllUsers = () =>
  api.get('/api/users').then(r => r.data);

// Admin panel — returns all users including deactivated
export const getAllUsersAdmin = () =>
  api.get('/api/users/admin-all').then(r => r.data);

export const getDMMessages = (userId, before = null) => {
  const params = before ? `?before=${before}&limit=50` : '?limit=50';
  return api.get(`/api/dm/${userId}/messages${params}`).then(r => r.data);
};

export const sendDMMessage = (userId, content) =>
  api.post(`/api/dm/${userId}/messages`, { content }).then(r => r.data);

export const updateMyProfile = (name) =>
  api.patch('/api/users/me', { name }).then(r => r.data);

export const updateMyAvatar = (avatar) =>
  api.patch('/api/users/me/avatar', { avatar }).then(r => r.data);

export const updateUserRole = (userId, role) =>
  api.patch(`/api/users/${userId}/role`, { role }).then(r => r.data);

export const updateUserStatus = (userId, is_active) =>
  api.patch(`/api/users/${userId}/status`, { is_active }).then(r => r.data);