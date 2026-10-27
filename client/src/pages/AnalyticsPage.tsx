import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  FolderKanban,
  Star,
  FileCode,
  Tag,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { analyticsService } from '../services/analytics.service';
import { AnalyticsData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async (days: number) => {
    setIsLoading(true);
    try {
      const res = await analyticsService.getAnalytics(days);
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const stats = data?.stats || {
    totalNotes: 0,
    totalCollections: 0,
    favoriteNotes: 0,
    notesAddedRecently: 0,
    totalWords: 0,
    totalRevisions: 0,
    connectedNotes: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-300 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
            Knowledge Base Analytics
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Deep insights into note capture cadence, content taxonomies, and intellectual growth.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-paper-300 text-xs shadow-xs">
          <span className="text-[11px] text-charcoal-400 px-2 font-medium">Timeline:</span>
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                timeRange === days
                  ? 'bg-olive-500 text-white'
                  : 'text-charcoal-600 hover:bg-paper-200'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Quantitative Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-400 mb-1.5">
            <span className="text-xs font-medium">Total Notes</span>
            <BookOpen className="w-4 h-4 text-olive-600" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.totalNotes}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Active knowledge artifacts</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-400 mb-1.5">
            <span className="text-xs font-medium">Total Words Authored</span>
            <Sparkles className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.totalWords.toLocaleString()}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Calculated across notes</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-400 mb-1.5">
            <span className="text-xs font-medium">Connected Graph Nodes</span>
            <Activity className="w-4 h-4 text-amberGold-500" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.connectedNotes}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Notes with explicit links</p>
        </div>

        <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between text-charcoal-400 mb-1.5">
            <span className="text-xs font-medium">Version Snapshots</span>
            <Layers className="w-4 h-4 text-sageTeal-500" />
          </div>
          <div className="text-2xl font-editorial font-bold text-charcoal-900">
            {stats.totalRevisions}
          </div>
          <p className="text-[11px] text-charcoal-500 mt-1">Historical revisions saved</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Area Chart */}
        <div className="bg-white border border-paper-300 rounded-xl p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-charcoal-900">
              Note Creation & Study Velocity
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Daily frequency of knowledge recorded
            </p>
          </div>

          <div className="h-64 w-full">
            {data?.activityTimeline && data.activityTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.activityTimeline}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#596A50" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#596A50" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#8E8D86" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8E8D86" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2DFD7',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="notes"
                    stroke="#596A50"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#analyticsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No activity recorded.
              </div>
            )}
          </div>
        </div>

        {/* Note Type Distribution (Bar Chart) */}
        <div className="bg-white border border-paper-300 rounded-xl p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-charcoal-900">
              Distribution by Note Modality
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Text notes vs code snippets vs web bookmarks vs research
            </p>
          </div>

          <div className="h-64 w-full">
            {data?.typeDistribution && data.typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.typeDistribution}>
                  <XAxis dataKey="type" stroke="#8E8D86" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8E8D86" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2DFD7',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.typeDistribution.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill || '#596A50'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No notes logged.
              </div>
            )}
          </div>
        </div>

        {/* Collection Breakdown (Pie Chart) */}
        <div className="bg-white border border-paper-300 rounded-xl p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-charcoal-900">
              Curated Collections Breakdown
            </h3>
            <p className="text-[11px] text-charcoal-500">
              Share of knowledge allocated per domain
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {data?.collectionDistribution && data.collectionDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.collectionDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {data.collectionDistribution.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color || '#596A50'} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-charcoal-400">No collections populated.</div>
            )}
          </div>
        </div>

        {/* Top Semantic Tags */}
        <div className="bg-white border border-paper-300 rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">
              Dominant Conceptual Tags
            </h3>
            <p className="text-[11px] text-charcoal-500 mb-4">
              Most frequently occurring terms and cross-cutting concepts
            </p>

            {data?.topTags && data.topTags.length > 0 ? (
              <div className="space-y-2.5">
                {data.topTags.slice(0, 6).map((tag, idx) => {
                  const maxCount = data.topTags[0]?.count || 1;
                  const pct = Math.round((tag.count / maxCount) * 100);
                  return (
                    <div key={tag.name} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-charcoal-800 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-charcoal-400" />
                          #{tag.name}
                        </span>
                        <span className="text-[11px] text-charcoal-500 font-mono">
                          {tag.count} notes
                        </span>
                      </div>
                      <div className="w-full bg-paper-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-olive-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-charcoal-400">
                No tags added to notes yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-paper-200 text-[11px] text-charcoal-500">
            Tags build organic links across multiple collections automatically.
          </div>
        </div>
      </div>
    </div>
  );
};
