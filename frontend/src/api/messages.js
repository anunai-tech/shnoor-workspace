import api from './axios';

export const addReaction = (msgId, emoji) =>
  api.post(`/api/messages/${msgId}/reactions`, { emoji }).then(r => r.data);

export const removeReaction = (msgId, emoji) =>
  api.delete(`/api/messages/${msgId}/reactions`, { data: { emoji } }).then(r => r.data);

export const searchMessages = (q, spaceId = null) => {
  const params = spaceId
    ? `?q=${encodeURIComponent(q)}&spaceId=${spaceId}`
    : `?q=${encodeURIComponent(q)}`;
  return api.get(`/api/search${params}`).then(r => r.data);
};

export const getDMConversations = () =>
  api.get('/api/dm/conversations').then(r => r.data);

export const getThreadReplies = (msgId) =>
  api.get(`/api/messages/${msgId}/thread`).then(r => r.data);

// edit a DM message by its id directly
export const editDMMessage = (msgId, content) =>
  api.patch(`/api/dm/messages/${msgId}`, { content }).then(r => r.data);

// delete a DM message by its id directly
export const deleteDMMessage = (msgId) =>
  api.delete(`/api/dm/messages/${msgId}`).then(r => r.data);

export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};