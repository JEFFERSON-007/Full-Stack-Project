import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { Collection, Note } from '../types';
import { collectionsService } from '../services/collections.service';

export const CollectionsPage: React.FC = () => {
  const { onOpenCollectionModal, refreshData } = useOutletContext<any>();
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await collectionsService.getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleDelete = async (e: React.MouseEvent, colId: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Delete collection "${name}"? Notes inside will not be deleted; their collection will become unassigned.`)) {
      try {
        await collectionsService.deleteCollection(colId);
        loadCollections();
        refreshData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete collection');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-300 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
            Curated Collections
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Organize personal notes into thematic domains, study tracks, and research projects.
          </p>
        </div>

        <button
          onClick={() => onOpenCollectionModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-charcoal-500">
          Loading collections...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* New Collection Card Trigger */}
          <div
            onClick={() => onOpenCollectionModal()}
            className="border-2 border-dashed border-paper-300 hover:border-olive-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-paper-50/80 group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-paper-200 group-hover:bg-olive-100 flex items-center justify-center text-charcoal-500 group-hover:text-olive-700 transition-colors mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-charcoal-800 group-hover:text-olive-700">
              Create New Collection
            </h3>
            <p className="text-xs text-charcoal-500 mt-1">
              Add a new knowledge domain or subject
            </p>
          </div>

          {/* Collection Cards */}
          {collections.map((col) => {
            const colId = col._id || col.id || '';
            return (
              <div
                key={colId}
                onClick={() => navigate(`/notes?collectionId=${colId}`)}
                className="bg-white border border-paper-300 hover:border-paper-400 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-paper-300"
                        style={{ backgroundColor: col.color || '#596A50' }}
                      />
                      <span className="text-[11px] font-mono text-charcoal-400 uppercase tracking-wider">
                        Collection
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCollectionModal(col);
                        }}
                        className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-100"
                        title="Edit Collection"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, colId, col.name)}
                        className="p-1 rounded text-terracotta-500 hover:text-terracotta-700 hover:bg-terracotta-50"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-charcoal-900 group-hover:text-olive-700 transition-colors mb-1.5">
                    {col.name}
                  </h3>

                  <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed mb-4">
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-paper-200 text-xs">
                  <span className="flex items-center gap-1.5 text-charcoal-600 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{col.noteCount ?? 0} {(col.noteCount ?? 0) === 1 ? 'note' : 'notes'}</span>
                  </span>

                  <span className="text-olive-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
