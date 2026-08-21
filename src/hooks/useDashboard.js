import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analytics/analyticsService';
import { historyService } from '../services/history/historyService';
import { useAuth } from './useAuth';

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, h] = await Promise.all([
        analyticsService.getDashboardMetrics(user?.id),
        historyService.getAll(user?.id)
      ]);
      setMetrics(m);
      setRecentHistory(h.slice(0, 5));
    } catch (err) {
      console.error("Failed loading dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { 
    loading, 
    metrics, 
    recentHistory,
    refreshDashboard: loadDashboardData
  };
};
