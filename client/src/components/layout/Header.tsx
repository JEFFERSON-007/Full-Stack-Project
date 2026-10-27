import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, Menu, Command } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewNote: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewNote,
  onToggleMobileSidebar,
}) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return { title: 'Workspace Overview', subtitle: 'Personal Knowledge Hub' };
      case '/notes':
        return { title: 'All Notes & Snippets', subtitle: 'Knowledge Library' };
      case '/collections':
        return { title: 'Collections & Categories', subtitle: 'Curated Taxonomies' };
      case '/graph':
        return { title: 'Knowledge Graph', subtitle: 'Connected Note Graph & Semantic Clusters' };
      case '/mindmaps':
        return { title: 'Interactive Mind Maps', subtitle: 'Visual Thought Canvases' };
      case '/analytics':
        return { title: 'Knowledge Analytics', subtitle: 'Insights & Note Distribution' };
      case '/favorites':
        return { title: 'Starred Notes', subtitle: 'High Priority Artifacts' };
      case '/recent':
        return { title: 'Recently Edited', subtitle: 'Latest Working Memory' };
      case '/settings':
        return { title: 'Vault Settings', subtitle: 'Preferences & Database Status' };
      default:
        return { title: 'Folio', subtitle: 'Knowledge Workspace' };
    }
  };

  const page = getPageTitle(location.pathname);

  return (
    <header className="h-16 px-6 border-b border-paper-300 bg-paper-100/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
      {/* Mobile Menu & Page Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-charcoal-700 hover:bg-paper-200"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-editorial font-bold text-charcoal-900 leading-tight">
              {page.title}
            </h2>
          </div>
          <p className="text-[11px] text-charcoal-500 font-sans hidden sm:block">
            {page.subtitle}
          </p>
        </div>
      </div>

      {/* Global Action Bar */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-paper-300 bg-white/70 hover:bg-white text-charcoal-600 hover:text-charcoal-900 text-xs transition-all shadow-xs"
          title="Search all notes, tags, and collections (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-charcoal-500" />
          <span className="hidden sm:inline">Search knowledge...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-charcoal-500 bg-paper-200 border border-paper-300 rounded">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Quick New Note */}
        <button
          onClick={onOpenNewNote}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>
    </header>
  );
};
