import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialBackups, initialNotifications, formatBytes } from '../data/mockData';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [backups, setBackups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [backendHealth, setBackendHealth] = useState(null);
  const [isLoadingBackups, setIsLoadingBackups] = useState(true);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const showToast = useCallback((toast) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Fetch health & diagnostic info
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setBackendHealth(data);
      setIsLiveBackend(true);
      setBackendError(null);
      return data;
    } catch (err) {
      setIsLiveBackend(false);
      setBackendError(err.message);
      return null;
    }
  }, []);

  // Fetch backups from backend; fallback gracefully if server not yet started
  const fetchBackups = useCallback(async () => {
    setIsLoadingBackups(true);
    try {
      const res = await api.getBackups();
      if (res.data && res.data.length > 0) {
        // Map backend S3 items to UI format
        const mapped = res.data.map(item => ({
          ...item,
          sizeLabel: formatBytes(item.size),
          duration: item.duration || 'Stored in S3',
          source: item.source || 'AWS S3 Bucket',
          tags: item.tags || ['s3-storage'],
        }));
        setBackups(mapped);
      } else {
        // No backups uploaded yet in bucket, start with empty list or demo mock list
        setBackups([]);
      }
      setIsLiveBackend(true);
    } catch (err) {
      // Backend not running yet or unreachable, use mock data as fallback
      console.warn('Backend currently offline, falling back to mock dataset:', err.message);
      setIsLiveBackend(false);
      setBackups(initialBackups);
    } finally {
      setIsLoadingBackups(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res.data && res.data.length > 0) {
        const mapped = res.data.map(n => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title,
          description: n.message,
          time: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          snsDelivered: n.snsDelivered,
          details: n.details,
        }));
        setNotifications(mapped);
      } else {
        setNotifications(initialNotifications);
      }
    } catch (err) {
      setNotifications(initialNotifications);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    checkHealth();
    fetchBackups();
    fetchNotifications();
  }, [checkHealth, fetchBackups, fetchNotifications]);

  const addBackup = useCallback((backup) => {
    setBackups(prev => [backup, ...prev]);
  }, []);

  const updateBackup = useCallback((id, updates) => {
    setBackups(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeBackup = useCallback((id) => {
    setBackups(prev => prev.filter(b => b.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [{ ...notification, id: `n-${Date.now()}`, read: false, time: 'just now' }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      backups, addBackup, updateBackup, removeBackup, fetchBackups, isLoadingBackups,
      notifications, addNotification, markAllRead, markRead, unreadCount, fetchNotifications,
      toasts, showToast,
      backendHealth, isLiveBackend, backendError, checkHealth,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
