import { api } from './api';
import { AnalyticsData } from '../types';

export const analyticsService = {
  getAnalytics: async (days: number = 30): Promise<AnalyticsData> => {
    const res = await api.get(`/analytics?days=${days}`);
    return res;
  },
};
