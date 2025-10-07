const API_BASE_URL = 'http://192.168.1.7/api';

export const listChats = async (loginToken) => {
  const headers = loginToken ? { 'X-Login': loginToken } : {};
  const res = await fetch(`${API_BASE_URL}/chat`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};

export const createChat = async (name, selectedMemberIds, loginToken) => {
  const headers = loginToken ? { 'X-Login': loginToken } : {};
  const params = new URLSearchParams({ name });
  // selectedMemberIds is an array of entity IDs; backend expects truthy flags by id
  (selectedMemberIds || []).forEach(id => params.set(id, '1'));
  const res = await fetch(`${API_BASE_URL}/chat/create?${params}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};

export const getMessages = async (chatId, loginToken) => {
  const headers = loginToken ? { 'X-Login': loginToken } : {};
  const res = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(chatId)}/messages`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};

export const sendMessage = async (chatId, body, loginToken) => {
  const headers = loginToken ? { 'X-Login': loginToken } : {};
  const params = new URLSearchParams({ chat: chatId, body });
  const res = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(chatId)}/send?${params}`, { headers, method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};


