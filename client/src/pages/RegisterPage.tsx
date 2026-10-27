import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-100 flex flex-col justify-center items-center p-6 selection:bg-olive-100 selection:text-olive-800">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-olive-500 text-white flex items-center justify-center mx-auto shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-editorial font-bold text-charcoal-900 tracking-tight">
            Create Your Vault
          </h1>
          <p className="text-xs text-charcoal-500 font-sans uppercase tracking-wider">
            Personal Knowledge Workspace
          </p>
          <p className="text-xs text-charcoal-600 max-w-xs mx-auto pt-1 leading-relaxed">
            Begin organizing, cross-linking, and visualizing your ideas.
          </p>
        </div>

        <div className="bg-white border border-paper-300 rounded-2xl p-7 shadow-card space-y-5">
          {error && (
            <div className="p-3 bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mariyam Akhtar"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-paper-50 border border-paper-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                  required
                />
              </div>
            </div>

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
                  placeholder="mariyam@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-paper-50 border border-paper-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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
              <span>{isLoading ? 'Creating Vault...' : 'Create Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-charcoal-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-olive-700 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
