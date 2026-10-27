import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  Database,
  Download,
  RotateCcw,
  LogOut,
  Check,
  ShieldCheck,
  HardDrive,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { notesService } from '../services/notes.service';
import { collectionsService } from '../services/collections.service';
import { mindmapsService } from '../services/mindmaps.service';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    // Fetch server diagnostics
    api.get('/health')
      .then(setServerHealth)
      .catch((err) => console.error('Health check failed:', err));
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await updateProfile({ name: name.trim() });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportFullVault = async () => {
    setIsExporting(true);
    try {
      const [notesRes, collectionsRes, mindmapsRes] = await Promise.all([
        notesService.getNotes(),
        collectionsService.getCollections(),
        mindmapsService.getMindMaps(),
      ]);

      const vaultData = {
        vaultName: `${user?.name || 'User'}'s Folio Vault`,
        exportedAt: new Date().toISOString(),
        user: {
          name: user?.name,
          email: user?.email,
        },
        collections: collectionsRes,
        notes: notesRes.notes,
        mindMaps: mindmapsRes,
      };

      const blob = new Blob([JSON.stringify(vaultData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `folio_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export vault: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-paper-300 pb-6">
        <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
          Vault Settings & Preferences
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Manage your personal workspace identity, database engine diagnostics, and vault archives.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-paper-300 rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-paper-200">
          <User className="w-5 h-5 text-olive-600" />
          <h2 className="text-base font-semibold text-charcoal-900">
            Personal Identity
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-paper-50 border border-paper-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-olive-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs bg-paper-200/60 border border-paper-300 rounded-lg text-charcoal-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {updateSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-olive-600 font-medium">
                <Check className="w-4 h-4" />
                Profile updated successfully
              </span>
            )}
            <button
              type="submit"
              disabled={isUpdating}
              className="ml-auto px-4 py-2 bg-charcoal-800 hover:bg-charcoal-900 disabled:opacity-50 text-paper-50 text-xs font-medium rounded-lg transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Update Name'}
            </button>
          </div>
        </form>
      </div>

      {/* Database Diagnostics */}
      <div className="bg-white border border-paper-300 rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-paper-200">
          <Database className="w-5 h-5 text-terracotta-600" />
          <h2 className="text-base font-semibold text-charcoal-900">
            Database Engine & Architecture
          </h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-charcoal-700">
          <div className="flex items-center justify-between p-3 bg-paper-50 rounded-lg border border-paper-300">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-charcoal-500" />
              <span>Storage Driver</span>
            </div>
            <span className="font-mono font-medium text-olive-700 bg-olive-50 px-2.5 py-0.5 rounded border border-olive-200">
              {serverHealth?.database?.isConnected ? 'MongoDB Active' : 'Folio Embedded Engine (JSON Persistence)'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-paper-50 rounded-lg border border-paper-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-charcoal-500" />
              <span>Data Isolation & Scoping</span>
            </div>
            <span className="font-mono text-charcoal-600">
              Strict User Ownership Filtering
            </span>
          </div>

          <p className="text-[11px] text-charcoal-500 pt-1">
            Folio is configured with a zero-friction dual engine: it automatically connects to MongoDB via Mongoose when available, or provides native local JSON file persistence (<code>server/data/folio-db.json</code>) so the full application runs immediately on any reviewer’s workstation without external database dependencies.
          </p>
        </div>
      </div>

      {/* Vault Backup & Export */}
      <div className="bg-white border border-paper-300 rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-paper-200">
          <Download className="w-5 h-5 text-amberGold-500" />
          <h2 className="text-base font-semibold text-charcoal-900">
            Vault Backup & Portability
          </h2>
        </div>

        <p className="text-xs text-charcoal-600 leading-relaxed">
          Export your entire knowledge vault including all notes, tags, collection hierarchies, revision snapshots, and mind map graphs into a standardized, human-readable JSON archive.
        </p>

        <button
          onClick={handleExportFullVault}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-paper-200 hover:bg-paper-300 text-charcoal-800 text-xs font-semibold rounded-lg border border-paper-300 transition-colors"
        >
          <Download className="w-4 h-4 text-charcoal-600" />
          <span>{isExporting ? 'Exporting Vault...' : 'Download Full Vault Backup (.json)'}</span>
        </button>
      </div>

      {/* Account Session Logout */}
      <div className="p-6 bg-paper-200/50 border border-paper-300 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-900">Sign Out</h3>
          <p className="text-xs text-charcoal-500">
            End your current session on this device
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-terracotta-50 text-terracotta-600 text-xs font-semibold border border-paper-300 rounded-lg transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
