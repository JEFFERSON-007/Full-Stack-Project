import { api } from './api';
import { MindMap, MindMapSummary } from '../types';

export const mindmapsService = {
  getMindMaps: async (): Promise<MindMapSummary[]> => {
    const res = await api.get('/mindmaps');
    return res.mindMaps || [];
  },

  getMindMapById: async (id: string): Promise<MindMap> => {
    const res = await api.get(`/mindmaps/${id}`);
    return res.mindMap;
  },

  createMindMap: async (data: { name: string; description?: string; nodes?: any[]; edges?: any[] }): Promise<MindMap> => {
    const res = await api.post('/mindmaps', data);
    return res.mindMap;
  },

  saveMindMap: async (id: string, data: { name?: string; description?: string; nodes: any[]; edges: any[] }): Promise<MindMap> => {
    const res = await api.put(`/mindmaps/${id}`, data);
    return res.mindMap;
  },

  deleteMindMap: async (id: string): Promise<void> => {
    await api.delete(`/mindmaps/${id}`);
  },
};
