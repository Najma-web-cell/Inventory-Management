import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get()); // restoring an existing session

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;
    api.me().then((r) => setUser(r.user)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async (email, password, remember) => {
    const r = await api.login(email, password);
    tokenStore.set(r.token, remember);
    setUser(r.user);
  }, []);

  const value = useMemo(() => ({
    user, loading, login, logout,
    can: (...roles) => !!user && roles.includes(user.role),
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
