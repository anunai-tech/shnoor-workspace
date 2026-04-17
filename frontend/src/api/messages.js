import api from './axios';

export const addReaction = (msgId, emoji) =>
  api.post(`/api/messages/${msgId}/reactions`, { emoji }).then(r => r.data);

export const removeReaction = (msgId, emoji) =>
  api.delete(`/api/messages/${msgId}/reactions`, { data: { emoji } }).then(r => r.data);

export const searchMessages = (q, spaceId = null) => {
  const params = spaceId ? `?q=${encodeURIComponent(q)}&spaceId=${spaceId}` : `?q=${encodeURIComponent(q)}`;
  return api.get(`/api/search${params}`).then(r => r.data);
};

export const getDMConversations = () =>
  api.get('/api/dm/conversations').then(r => r.data);