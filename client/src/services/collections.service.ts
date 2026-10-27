import { api } from './api';
import { Collection, Note } from '../types';

export const collectionsService = {
  getCollections: async (): Promise<Collection[]> => {
    const res = await api.get('/collections');
    return res.collections || [];
  },

  getCollectionById: async (id: string): Promise<{ collection: Collection; notes: Note[] }> => {
    const res = await api.get(`/collections/${id}`);
    return res;
  },

  createCollection: async (data: { name: string; description?: string; color?: string; icon?: string }): Promise<Collection> => {
    const res = await api.post('/collections', data);
    return res.collection;
  },

  updateCollection: async (id: string, data: Partial<Collection>): Promise<Collection> => {
    const res = await api.put(`/collections/${id}`, data);
    return res.collection;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};
