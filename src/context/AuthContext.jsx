import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ng_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('ng_token');
      localStorage.removeItem('ng_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('ng_token', data.token);
    localStorage.setItem('ng_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await API.post('/auth/verify-otp', { email, otp });
    return data;
  };

  const googleLogin = async (token) => {
    const { data } = await API.post('/auth/google', { token });
    localStorage.setItem('ng_token', data.token);
    localStorage.setItem('ng_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ng_token');
    localStorage.removeItem('ng_user');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
