import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderKanban,
  Star,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Network,
  GitFork,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analytics.service';
import { notesService } from '../services/notes.service';
import { NoteCard } from '../components/notes/NoteCard';
import { AnalyticsData, Note } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onOpenNewNote, onOpenEditNote, collections } = useOutletContext<any>();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick Capture State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  const fetchAnalytics = async (days: number) => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getAnalytics(days);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsQuickSaving(true);
    try {
      await notesService.createNote({
        title: quickTitle.trim(),
        content: quickContent.trim(),
        type: 'text',
      });
      setQuickTitle('');
      setQuickContent('');
      fetchAnalytics(timeRange);
    } catch (err) {
      console.error('Quick capture failed:', err);
    } finally {
      setIsQuickSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Delete this note permanently?')) {
      try {
        await notesService.deleteNote(noteId);
        fetchAnalytics(timeRange);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleDuplicateNote = async (noteId: string) => {
    try {
      await notesService.duplicateNote(noteId);
      fetchAnalytics(timeRange);
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  // Greeting by hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = analytics?.stats || {
    totalNotes: 0,
    totalCollections: 0,
    favoriteNotes: 0,
    notesAddedRecently: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome & Philosophy Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-paper-300 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-charcoal-900 mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Scholar'}.
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 max-w-xl">
            Your personal digital library. Capture thoughts quickly, discover hidden connections,
            and visualize the topology of your knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/graph')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-paper-200 hover:bg-paper-300 text-charcoal-800 text-xs font-medium transition-colors border border-paper-300"
          >
            <Network className="w-4 h-4 text-olive-600" />
            <span>Open Graph</span>
          </button>
          <button
            onClick={() => navigate('/mindmaps')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-paper-200 hover:bg-paper-300 text-charcoal-800 text-xs font-medium transition-colors border border-paper-300"
          >
            <GitFork className="w-4 h-4 text-terracotta-600" />
            <span>Mind Maps</span>
          </button>
          <button
            onClick={onOpenNewNote}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Quick Capture Bar */}
      <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
        <form onSubmit={handleQuickCapture} className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-olive-600 flex-shrink-0" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Quick Capture: Note a sudden idea, key insight, or lecture point..."
              className="w-full text-xs sm:text-sm text-charcoal-900 bg-transparent border-0 focus:outline-none placeholder:text-charcoal-400"
            />
            <button
              type="submit"
              disabled={isQuickSaving || !quickTitle.trim()}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-900 disabled:opacity-40 text-paper-50 text-xs font-medium transition-colors"
            >
              {isQuickSaving ? 'Saving...' : 'Save Quick'}
            </button>
          </div>
          {quickTitle && (
            <textarea
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              placeholder="Optional notes or details..."
              rows={2}
              className="w-full text-xs text-charcoal-700 bg-paper-50 rounded-lg p-2.5 border border-paper-300 focus:outline-none"
            />
          )}
        </form>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Total Notes</span>
            <BookOpen className="w-4 h-4 text-olive-600" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.totalNotes}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Across all taxonomies</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Collections</span>
            <FolderKanban className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.totalCollections}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Curated categories</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Starred Notes</span>
            <Star className="w-4 h-4 text-amberGold-500" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.favoriteNotes}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Priority knowledge</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-medium">Added Recently</span>
            <Clock className="w-4 h-4 text-sageTeal-500" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.notesAddedRecently}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Past 7 days</p>
        </div>
      </div>

      {/* Visual Analytics Grid: Activity Timeline + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white border border-paper-300 rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900">
                Knowledge Capture Over Time
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Note creation momentum and review frequency
              </p>
            </div>

            {/* Date range filter */}
            <div className="flex items-center gap-1 bg-paper-100 p-0.5 rounded-lg border border-paper-300 text-xs">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    timeRange === days
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {analytics?.activityTimeline && analytics.activityTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.activityTimeline}>
                  <defs>
                    <linearGradient id="folioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#596A50" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#596A50" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#8E8D86"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2DFD7' }}
                  />
                  <YAxis
                    stroke="#8E8D86"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2DFD7',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(37, 39, 32, 0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="notes"
                    stroke="#596A50"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#folioGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No activity data in this date range.
              </div>
            )}
          </div>
        </div>

        {/* Category / Collection Distribution */}
        <div className="bg-white border border-paper-300 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">
              Knowledge Distribution
            </h3>
            <p className="text-[11px] text-charcoal-500 mb-2">
              Breakdown across collections
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {analytics?.collectionDistribution && analytics.collectionDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.collectionDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.collectionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#596A50'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2DFD7',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-charcoal-400">No notes categorized yet.</div>
            )}
          </div>

          {/* Collection Legend pills */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-paper-200">
            {analytics?.collectionDistribution?.slice(0, 4).map((col) => (
              <span
                key={col.name}
                className="inline-flex items-center gap-1.5 text-[10px] text-charcoal-600 bg-paper-100 px-2 py-0.5 rounded-full"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="truncate max-w-[100px]">{col.name}</span>
                <span className="font-mono text-charcoal-400">({col.count})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Edited Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-editorial font-bold text-charcoal-900">
              Recently Edited Notes
            </h2>
            <p className="text-xs text-charcoal-500">Pick up where you left off</p>
          </div>
          <button
            onClick={() => navigate('/notes')}
            className="flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 transition-colors"
          >
            <span>View all notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {analytics?.recentlyEdited && analytics.recentlyEdited.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.recentlyEdited.slice(0, 6).map((note) => (
              <NoteCard
                key={note._id || note.id}
                note={note}
                collections={collections}
                onEdit={onOpenEditNote}
                onDelete={handleDeleteNote}
                onDuplicate={handleDuplicateNote}
                onToggleFavorite={async (id) => {
                  await notesService.toggleFavorite(id);
                  fetchAnalytics(timeRange);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-paper-300 rounded-xl">
            <p className="text-xs text-charcoal-500">No notes created yet.</p>
            <button
              onClick={onOpenNewNote}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-olive-500 text-white text-xs font-medium"
            >
              Create your first note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
