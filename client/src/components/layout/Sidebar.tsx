import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Network,
  GitFork,
  BarChart3,
  Star,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  BookMarked,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Collection } from '../../types';

interface SidebarProps {
  onOpenNewNote: () => void;
  collections?: Collection[];
  onOpenNewCollection?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewNote,
  collections = [],
  onOpenNewCollection,
  mobileOpen,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mainNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/notes', label: 'All Notes', icon: BookOpen },
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/graph', label: 'Knowledge Graph', icon: Network, highlight: true },
    { to: '/mindmaps', label: 'Mind Maps', icon: GitFork },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const filterNavItems = [
    { to: '/favorites', label: 'Favorites', icon: Star },
    { to: '/recent', label: 'Recently Edited', icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-olive-500 text-white shadow-sm'
        : 'text-charcoal-700 hover:bg-paper-300/60 hover:text-charcoal-900'
    }`;

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col justify-between bg-paper-200 border-r border-paper-300 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-olive-500 text-white flex items-center justify-center shadow-sm">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-editorial font-bold text-charcoal-900 tracking-tight leading-none">
              Folio
            </h1>
            <p className="text-[11px] text-charcoal-500 font-sans tracking-wide uppercase mt-1">
              Personal Knowledge
            </p>
          </div>
        </div>

        {/* Quick New Note Button */}
        <button
          onClick={() => {
            onOpenNewNote();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-charcoal-800 text-paper-50 text-xs font-semibold hover:bg-charcoal-900 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-olive-200" />
          <span>Capture Note</span>
          <span className="ml-auto text-[10px] text-charcoal-400 font-mono bg-charcoal-700 px-1.5 py-0.5 rounded">
            N
          </span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase px-3 mb-2">
            Workspace
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={navClass}
                onClick={onCloseMobile}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-olive-600"></span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Collections in Sidebar */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <NavLink
              to="/collections"
              className="text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase hover:text-charcoal-900 transition-colors"
            >
              Collections {collections && collections.length > 0 && `(${collections.length})`}
            </NavLink>
            {onOpenNewCollection && (
              <button
                type="button"
                onClick={onOpenNewCollection}
                title="Create new collection"
                className="p-1 rounded hover:bg-paper-300 text-charcoal-500 hover:text-charcoal-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {collections && collections.length > 0 ? (
              collections.map((col) => {
                const colId = col._id || col.id;
                return (
                  <NavLink
                    key={colId}
                    to={`/notes?collectionId=${colId}`}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-paper-300 text-charcoal-900 font-semibold'
                          : 'text-charcoal-700 hover:bg-paper-300/60 hover:text-charcoal-900'
                      }`
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col.color || '#596A50' }}
                    />
                    <span className="truncate flex-1">{col.name}</span>
                    {typeof col.noteCount === 'number' && (
                      <span className="text-[10px] text-charcoal-400 font-mono">
                        {col.noteCount}
                      </span>
                    )}
                  </NavLink>
                );
              })
            ) : (
              <div className="px-3 py-1 text-[11px] text-charcoal-400 italic">
                No collections yet
              </div>
            )}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase px-3 mb-2">
            Quick Views
          </p>
          <nav className="space-y-1">
            {filterNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navClass}
                onClick={onCloseMobile}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-charcoal-500 uppercase px-3 mb-2">
            System
          </p>
          <nav className="space-y-1">
            <NavLink
              to="/settings"
              className={navClass}
              onClick={onCloseMobile}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Settings & Vault</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* User Footer Profile & Account Menu */}
      <div className="p-4 border-t border-paper-300 relative">
        <div
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-paper-300/60 cursor-pointer transition-colors"
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-paper-400 object-cover bg-paper-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-charcoal-900 truncate">
              {user?.name || 'Knowledge Seeker'}
            </p>
            <p className="text-[11px] text-charcoal-500 truncate">
              {user?.email || 'user@folio.local'}
            </p>
          </div>
          <ChevronRight className={`w-4 h-4 text-charcoal-400 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
        </div>

        {/* User Account Popover */}
        {userMenuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-white border border-paper-300 rounded-xl shadow-dropdown py-1.5 z-50">
            <div className="px-3 py-2 border-b border-paper-200">
              <p className="text-xs font-medium text-charcoal-800">{user?.name}</p>
              <p className="text-[10px] text-charcoal-500 font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                navigate('/settings');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full text-left px-3 py-2 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Workspace Preferences</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs text-terracotta-600 hover:bg-terracotta-50 flex items-center gap-2 border-t border-paper-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
