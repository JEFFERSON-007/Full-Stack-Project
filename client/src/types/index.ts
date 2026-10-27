export type NoteType = 'text' | 'code' | 'link' | 'research';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    defaultView?: 'grid' | 'list';
  };
}

export interface Collection {
  _id?: string;
  id?: string;
  user?: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  noteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  _id?: string;
  id?: string;
  user?: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  collectionId?: string | null;
  isFavorite?: boolean;
  isPinned?: boolean;
  codeLanguage?: string;
  sourceUrl?: string;
  relatedNotes?: string[];
  relatedNotesDetails?: Array<{ id: string; title: string; type: NoteType }>;
  revisionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRevision {
  _id?: string;
  id?: string;
  noteId: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  changeSummary?: string;
  createdAt: string;
}

export interface MindMapSummary {
  id: string;
  name: string;
  description?: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MindMap {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StatsOverview {
  totalNotes: number;
  totalCollections: number;
  favoriteNotes: number;
  notesAddedRecently: number;
  totalWords: number;
  totalRevisions: number;
  connectedNotes: number;
}

export interface TimelinePoint {
  date: string;
  notes: number;
}

export interface TypeDistributionItem {
  type: string;
  key: NoteType;
  count: number;
  fill: string;
}

export interface CollectionDistributionItem {
  name: string;
  color: string;
  count: number;
}

export interface TopTagItem {
  name: string;
  count: number;
}

export interface AnalyticsData {
  stats: StatsOverview;
  activityTimeline: TimelinePoint[];
  collectionDistribution: CollectionDistributionItem[];
  typeDistribution: TypeDistributionItem[];
  topTags: TopTagItem[];
  recentlyEdited: Note[];
  pinnedNotes: Note[];
}
