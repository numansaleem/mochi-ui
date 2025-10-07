import React, { useEffect, useState } from 'react';
import { listChats, createChat, getMessages, sendMessage } from '../api/chat';
import { getFriends } from '../api/friends';

const Chat = () => {
  const [loginToken, setLoginToken] = useState('');
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newChatName, setNewChatName] = useState('');
  const [newChatMembers, setNewChatMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('loginToken') || '';
    if (saved && !loginToken) setLoginToken(saved);
  }, []);

  useEffect(() => {
    if (!loginToken) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [chatData, friendData] = await Promise.all([
          listChats(loginToken),
          getFriends(loginToken)
        ]);
        console.log('Chat list response:', chatData);
        console.log('Friends response:', friendData);
        // chatData is the array directly from the API
        setChats(Array.isArray(chatData) ? chatData : []);
        // friendData.friends contains the array
        const fs = friendData.friends || [];
        setFriends(fs);
      } catch (e) {
        console.error('Error loading data:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [loginToken]);

  const openChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const data = await getMessages(chat.id, loginToken);
      console.log('Messages response:', data);
      // data.messages is the array directly (from {format:"json", data:{messages:[...]}})
      setMessages(data.messages || []);
    } catch (e) {
      console.error('Failed to load messages:', e);
      setError(e.message);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return alert('Enter chat name');
    try {
      const res = await createChat(newChatName.trim(), newChatMembers, loginToken);
      const created = res.data || res; // { id, name, members }
      setChats([{ id: created.id, name: created.name }, ...chats]);
      setNewChatName('');
      setNewChatMembers([]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedChat) return;
    if (!newMessage.trim()) return;
    try {
      await sendMessage(selectedChat.id, newMessage.trim(), loginToken);
      setNewMessage('');
      const data = await getMessages(selectedChat.id, loginToken);
      setMessages(data.messages || []);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Loading chat…</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <aside style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 8, padding: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Login Token</label>
          <input
            type="text"
            value={loginToken}
            onChange={(e) => {
              const v = e.target.value; setLoginToken(v); window.localStorage.setItem('loginToken', v);
            }}
            placeholder="Enter your login token"
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          />
        </div>

        <form onSubmit={handleCreateChat} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>New Chat Name</label>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Team chat"
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Members</label>
            <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
              {friends.map(f => (
                <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    checked={newChatMembers.includes(f.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewChatMembers(prev => checked ? [...prev, f.id] : prev.filter(x => x !== f.id));
                    }}
                  />
                  <span>{f.name} <span style={{ color: '#999', fontSize: 12 }}>({f.id})</span></span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" style={{ background: '#111', color: '#fff', border: 0, borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>
            Create Chat
          </button>
        </form>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Chats</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {chats.map(c => (
              <button key={c.id} onClick={() => openChat(c)} style={{
                background: selectedChat?.id === c.id ? '#eef3ff' : '#fff',
                border: '1px solid #eaeaea', borderRadius: 6, padding: '8px 10px', textAlign: 'left', cursor: 'pointer'
              }}>
                {c.name || c.id}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 8, padding: 12, minHeight: 400 }}>
        {!selectedChat ? (
          <div style={{ color: '#666' }}>Select a chat from the left, or create a new one.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{selectedChat.name || selectedChat.id}</div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 6, padding: '4px 0 8px' }}>
              {messages.map(m => (
                <div key={m.id || m.created} style={{ background: '#f7f8fa', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
              />
              <button type="submit" style={{ background: '#111', color: '#fff', border: 0, borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>
                Send
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

export default Chat;


