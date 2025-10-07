import React, { useState, useEffect } from 'react';
import { getFriends, createFriend } from '../api/friends';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFriendId, setNewFriendId] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [creating, setCreating] = useState(false);

  // Initialize token from localStorage and load friends when token is present
  useEffect(() => {
    const saved = window.localStorage.getItem('loginToken') || '';
    if (saved && !loginToken) {
      setLoginToken(saved);
    }
  }, []);

  useEffect(() => {
    if (loginToken && loginToken.trim()) {
      loadFriends();
    } else {
      setFriends([]);
      setInvites([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginToken]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFriends(loginToken);
      setFriends(data.friends || []);
      setInvites(data.invites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFriend = async (e) => {
    e.preventDefault();
    
    if (!newFriendId.trim() || !newFriendName.trim()) {
      alert('Please enter both ID and name');
      return;
    }

    try {
      setCreating(true);
      await createFriend(newFriendId.trim(), newFriendName.trim(), loginToken);
      
      // Clear form
      setNewFriendId('');
      setNewFriendName('');
      
      // Reload friends list
      await loadFriends();
      
      alert('Friend created successfully!');
    } catch (err) {
      alert(`Error creating friend: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Friends</h2>
        <p>Loading friends...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Friends</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Add Friend Form */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3>Add New Friend</h3>
        <form onSubmit={handleCreateFriend}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Login Token (required for authentication)
            </label>
            <input
              type="text"
              value={loginToken}
              onChange={(e) => {
                const v = e.target.value;
                setLoginToken(v);
                window.localStorage.setItem('loginToken', v);
              }}
              placeholder="Enter your login token"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Required to access database and send messages. Get this from your Mochi account.
            </small>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Friend ID:
            </label>
            <input
              type="text"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              placeholder="Enter friend's ID"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Friend Name:
            </label>
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Enter friend's name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={creating}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: creating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: creating ? 0.7 : 1
            }}
          >
            {creating ? 'Creating...' : 'Add Friend'}
          </button>
        </form>
      </div>

      {/* Friends List */}
      <div style={{ marginBottom: '30px' }}>
        <h3>My Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No friends yet. Add some friends above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {friends.map((friend, index) => (
              <div
                key={`${friend.identity}-${friend.id}`}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                  {friend.name}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  ID: {friend.id}
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  Identity: {friend.identity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invitations */}
      {invites.length > 0 && (
        <div>
          <h3>Pending Invitations ({invites.length})</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {invites.map((invite, index) => (
              <div
                key={`${invite.identity}-${invite.id}`}
                style={{
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ffb74d',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                  {invite.name}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  ID: {invite.id}
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  Invitation from: {invite.identity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;
