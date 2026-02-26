import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set axios defaults with proper baseURL handling
const getBaseURL = () => {
  // In development, use /api (handled by Vite proxy in vite.config.js)
  if (import.meta.env.MODE === 'development') {
    return '/api';
  }
  // In production, use full URL from environment
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}/api`;
};

axios.defaults.baseURL = getBaseURL();
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // when the context mounts we want to know if there's a valid
        // session already (page refresh, etc). this will set `user` to the
        // payload returned by the server or null if not authenticated.
        checkUserLoggedIn();

        // globally clear auth state on 401 so that protected routes redirect
        const interceptor = axios.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401) {
                    setUser(null);
                }
                return Promise.reject(err);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await axios.get('/auth/me');
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('/auth/register', userData);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await axios.get('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                checkUserLoggedIn
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
