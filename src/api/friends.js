const API_BASE_URL = 'http://192.168.1.7/api';

/**
 * Fetch friends list from the API
 * @param {string} loginToken - Optional login token for authentication
 * @returns {Promise<Object>} Response containing friends and invites
 */
export const getFriends = async (loginToken) => {
  try {
    const headers = {};
    if (loginToken && loginToken.trim()) {
      headers['X-Login'] = loginToken.trim();
    }
    
    const response = await fetch(`${API_BASE_URL}/friends/list`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

/**
 * Create a new friend
 * @param {string} id - The friend's ID
 * @param {string} name - The friend's name
 * @param {string} loginToken - Optional login token for authentication
 * @returns {Promise<Object>} Response from the API
 */
export const createFriend = async (id, name, loginToken) => {
  try {
    const params = new URLSearchParams({
      id: id,
      name: name
    });
    
    const headers = {};
    if (loginToken && loginToken.trim()) {
      headers['X-Login'] = loginToken.trim();
    }
    
    const response = await fetch(`${API_BASE_URL}/friends/create?${params}`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating friend:', error);
    throw error;
  }
};
