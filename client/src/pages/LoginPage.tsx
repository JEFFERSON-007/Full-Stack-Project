import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col justify-center items-center p-6 selection:bg-olive-100 selection:text-olive-800">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Editorial Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-olive-500 text-white flex items-center justify-center mx-auto shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-editorial font-bold text-charcoal-900 tracking-tight">
            Folio
          </h1>
          <p className="text-xs text-charcoal-500 font-sans uppercase tracking-wider">
            Personal Knowledge Workspace
          </p>
          <p className="text-xs text-charcoal-600 max-w-xs mx-auto pt-1 leading-relaxed">
            A quiet, thoughtful space to capture, cross-link, and visualize your thoughts.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-paper-300 rounded-2xl p-7 shadow-card space-y-5">
          {error && (
            <div className="p-3 bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@folio.workspace"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-paper-50 border border-paper-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-charcoal-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-paper-50 border border-paper-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-olive-500 hover:bg-olive-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-paper-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-charcoal-400 font-mono">
              OR FOR EVALUATION
            </span>
          </div>

          {/* 1-Click Demo Account Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-paper-100 hover:bg-paper-200 border border-paper-300 text-charcoal-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-olive-600 group-hover:scale-110 transition-transform" />
            <span>1-Click Demo Sign In (Alex Chen)</span>
          </button>
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs text-charcoal-500">
          New to Folio?{' '}
          <Link
            to="/register"
            className="text-olive-700 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
