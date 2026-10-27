import { api } from './api';
import { Note, NoteRevision, NoteType } from '../types';

export interface NotesQueryFilter {
  search?: string;
  collectionId?: string;
  type?: NoteType;
  tag?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  sort?: 'updatedAt' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
}

export const notesService = {
  getNotes: async (filters: NotesQueryFilter = {}): Promise<{ count: number; notes: Note[] }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.collectionId) params.append('collectionId', filters.collectionId);
    if (filters.type) params.append('type', filters.type);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.isFavorite !== undefined) params.append('isFavorite', String(filters.isFavorite));
    if (filters.isPinned !== undefined) params.append('isPinned', String(filters.isPinned));
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/notes${queryStr}`);
    return res;
  },

  getNoteById: async (id: string): Promise<Note> => {
    const res = await api.get(`/notes/${id}`);
    return res.note;
  },

  createNote: async (data: Partial<Note>): Promise<Note> => {
    const res = await api.post('/notes', data);
    return res.note;
  },

  updateNote: async (id: string, data: Partial<Note> & { changeSummary?: string }): Promise<Note> => {
    const res = await api.put(`/notes/${id}`, data);
    return res.note;
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  duplicateNote: async (id: string): Promise<Note> => {
    const res = await api.post(`/notes/${id}/duplicate`);
    return res.note;
  },

  toggleFavorite: async (id: string): Promise<boolean> => {
    const res = await api.patch(`/notes/${id}/favorite`);
    return res.isFavorite;
  },

  getTags: async (): Promise<Array<{ name: string; count: number }>> => {
    const res = await api.get('/notes/tags');
    return res.tags || [];
  },

  getRevisions: async (noteId: string): Promise<NoteRevision[]> => {
    const res = await api.get(`/notes/${noteId}/revisions`);
    return res.revisions || [];
  },

  restoreRevision: async (noteId: string, revisionId: string): Promise<Note> => {
    const res = await api.post(`/notes/${noteId}/revisions/${revisionId}/restore`);
    return res.note;
  },
};
