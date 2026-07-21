import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth data from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple validation
    if (!email || !password) {
      throw new Error('Please fill in all fields');
    }

    // Default mock user credentials or check in localStorage mock database
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const matchedUser = users.find(u => u.email === email && u.password === password);

    let authUser;
    if (matchedUser) {
      authUser = {
        id: matchedUser.id,
        username: matchedUser.username,
        email: matchedUser.email,
        bio: matchedUser.bio || 'Developer, Organizer & Event Enthusiast.',
        avatar: matchedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        joinedDate: matchedUser.joinedDate || 'July 2026'
      };
    } else if (email === 'admin@eventhub.com' && password === 'admin123') {
      // Default fallback developer account
      authUser = {
        id: 1,
        username: 'Alex Morgan',
        email: 'admin@eventhub.com',
        bio: 'Lead Event Coordinator at Future Tech Lab. Passionate about bringing creative developers and innovators together.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        joinedDate: 'January 2026'
      };
    } else {
      throw new Error('Invalid email or password');
    }

    const mockToken = 'mock-jwt-token-xyz123';
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    
    setToken(mockToken);
    setUser(authUser);
    
    return authUser;
  };

  const register = async (username, email, password) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!username || !email || !password) {
      throw new Error('Please fill in all fields');
    }

    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (users.some(u => u.email === email)) {
      throw new Error('Email is already registered');
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password, // Storing password raw for mock demo purposes
      bio: 'New attendee and event enthusiast.',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=150&q=80`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));

    // Auto login after registration
    const authUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      avatar: newUser.avatar,
      joinedDate: newUser.joinedDate
    };

    const mockToken = 'mock-jwt-token-xyz123';
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    
    setToken(mockToken);
    setUser(authUser);

    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const updatedUser = {
      ...user,
      username: profileData.username || user.username,
      bio: profileData.bio || user.bio,
      avatar: profileData.avatar || user.avatar
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Also update in mock users list
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem('mock_users', JSON.stringify(users));
    }

    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
