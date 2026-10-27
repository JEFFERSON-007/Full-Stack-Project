import React, { useState, useEffect } from 'react';
import { X, Folder, Save } from 'lucide-react';
import { Collection } from '../../types';
import { collectionsService } from '../../services/collections.service';

interface CollectionModalProps {
  isOpen: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSaved: (collection: Collection) => void;
}

const PALETTE = [
  '#596A50', // Olive
  '#BF765C', // Terracotta
  '#D99B26', // Amber Gold
  '#4E7271', // Sage Teal
  '#6E6D66', // Charcoal Stone
  '#8A503C', // Deep Rust
  '#485641', // Deep Forest
  '#252720', // Charcoal Deep
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  collection,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#596A50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
      setColor(collection.color || '#596A50');
    } else {
      setName('');
      setDescription('');
      setColor('#596A50');
    }
  }, [collection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      let result: Collection;
      if (collection && (collection._id || collection.id)) {
        const id = collection._id || collection.id || '';
        result = await collectionsService.updateCollection(id, {
          name: name.trim(),
          description: description.trim(),
          color,
        });
      } else {
        result = await collectionsService.createCollection({
          name: name.trim(),
          description: description.trim(),
          color,
        });
      }

      onSaved(result);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white border border-paper-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-paper-300 flex items-center justify-between bg-paper-50">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-olive-600" />
            <h3 className="text-base font-semibold text-charcoal-900">
              {collection ? 'Edit Collection' : 'Create New Collection'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems"
              className="w-full px-3 py-2 text-sm bg-paper-50 border border-paper-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-olive-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of knowledge domain..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-paper-50 border border-paper-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-olive-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-charcoal-800' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-paper-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-charcoal-600 hover:bg-paper-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-olive-500 hover:bg-olive-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Collection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
