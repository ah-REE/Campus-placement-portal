import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('token')) {
        try { const { data } = await api.get('/auth/me'); setUser(data.user); }
        catch { localStorage.removeItem('token'); }
      }
      setLoading(false);
    })();
  }, []);

  const login = (token, u) => { localStorage.setItem('token', token); setUser(u); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);