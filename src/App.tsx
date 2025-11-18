import { useState, useEffect } from 'react';
import { Search, Upload } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PreprintCard from './components/PreprintCard';
import PreprintDetails from './components/PreprintDetails';
import UploadModal from './components/UploadModal';
import { Preprint, fetchPreprints } from './api/preprints';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

/* ---------- Small inline component for secret admin key ---------- */
function AdminLoginBox({
  adminKey,
  onLogin,
  onLogout,
}: {
  adminKey: string | null;
  onLogin: (key: string) => void;
  onLogout: () => void;
}) {
  const [value, setValue] = useState('');

  if (adminKey) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
          Admin mode
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md bg-slate-800/80 hover:bg-slate-700 text-xs px-2 py-1 border border-white/10"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onLogin(value.trim());
        setValue('');
      }}
    >
      <input
        type="password"
        placeholder="Admin key"
        className="glass-effect border-white/20 rounded-lg px-2 py-1 text-xs bg-black/40 text-gray-100 border focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/80 placeholder-gray-500 hover:border-white/40 transition-all"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-slate-800/80 hover:bg-slate-700 text-xs px-2 py-1 border border-white/10"
      >
        Admin
      </button>
    </form>
  );
}

function App() {
  // ---------- Supabase auth state ----------
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const enforceRvuDomain = (sess: Session | null): Session | null => {
    if (!sess) return null;
    const email = sess.user.email?.toLowerCase() ?? '';

    if (!email.endsWith('@rvu.edu.in')) {
      supabase.auth.signOut();
      setAuthError('Only RVU email IDs (@rvu.edu.in) are allowed to access this portal.');
      return null;
    }

    return sess;
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Error getting session', error);
        setAuthError('Failed to check login status.');
        setAuthLoading(false);
        return;
      }

      const validSession = enforceRvuDomain(data.session ?? null);
      setSession(validSession);
      setAuthLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const validSession = enforceRvuDomain(newSession);
      setSession(validSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Google sign-in error', error);
      setAuthError(error.message || 'Failed to sign in with Google.');
    }
  };

  const [preprints, setPreprints] = useState<Preprint[]>([]);
  const [selectedPreprint, setSelectedPreprint] = useState<Preprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  const loadPreprints = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const data = await fetchPreprints(params);
      setPreprints(data);

      if (selectedPreprint) {
        const updated = data.find((p) => p.id === selectedPreprint.id);
        setSelectedPreprint(updated ?? null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load preprints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreprints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory]);

  const handleUploadSuccess = (newPreprint: Preprint) => {
    setIsUploadModalOpen(false);
    loadPreprints();
    setSelectedPreprint(newPreprint);
  };

  // Called after a successful admin delete
  const handleDeleted = (id: number) => {
    setPreprints((prev) => prev.filter((p) => p.id !== id));
    if (selectedPreprint?.id === id) {
      setSelectedPreprint(null);
    }
  };

  // ---------- Auth gating before rendering the app ----------
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-300 text-sm">Checking your RVU login…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="max-w-md w-full border border-white/10 rounded-2xl p-8 space-y-6 text-center bg-slate-900/70 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">RVU Preprint Repository</h1>
          <p className="text-sm text-gray-300">
            Please sign in with your <span className="font-medium">@rvu.edu.in</span> Google
            account to continue.
          </p>

          {authError && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/50 px-3 py-2 rounded-md">
              {authError}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.1h146.9c-6.3 34.1-25.1 63-53.5 82.4v68h86.5c50.6-46.6 81.6-115.3 81.6-195.2z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.7 0 133.8-24 178.4-65.1l-86.5-68c-24 16.1-54.7 25.7-91.9 25.7-70.6 0-130.4-47.7-151.9-111.4H31.4v69.9C75.7 486.2 167.1 544.3 272 544.3z"
              />
              <path
                fill="#FBBC05"
                d="M120.1 325.5c-10.1-30.1-10.1-62.7 0-92.8V162.8H31.4c-36.5 72.9-36.5 159.6 0 232.5l88.7-69.8z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.5-.6 77.6 14 106.4 40.9l79.3-79.3C405.7 24.4 340.4-.3 272 0 167.1 0 75.7 58.1 31.4 162.8l88.7 69.9C141.6 155.4 201.4 107.7 272 107.7z"
              />
            </svg>
            <span>Sign in with RVU Google</span>
          </button>

          <p className="text-xs text-gray-500">
            Access is restricted to RV University email IDs only.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Original app UI (only for logged-in RVU users) ----------
  return (
    <div className="min-h-screen text-gray-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="glass-effect border-b border-white/10 px-6 py-4 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-emerald-400" />
              <input
                type="text"
                placeholder="Search by title, abstract, authors, course code or faculty..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 text-sm placeholder-gray-500 text-gray-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-lg bg-black/40 border border-white/10 px-3 py-2 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/30 text-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="FDS">Data Science</option>
              <option value="FDE">Cyber Security</option>
              <option value="TOC">Theory of Computation</option>
              <option value="OS">Operating Systems</option>
              <option value="CN">Computer Networks</option>
              <option value="ML">Machine Learning</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Preprint</span>
            </button>

            <AdminLoginBox
              adminKey={adminKey}
              onLogin={(key) => setAdminKey(key)}
              onLogout={() => setAdminKey(null)}
            />
          </div>
        </header>

        {/* ---------- FIXED LAYOUT BLOCK ---------- */}
        <div className="flex-1 grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 p-6">
          {/* Left column: list */}
          <div className="space-y-3">
            {loading && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-8 flex items-center justify-center">
                <div className="space-y-3 text-center">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  <p className="text-gray-400">Loading preprints...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            {!loading && !error && preprints.length === 0 && (
              <div className="text-center py-12 bg-black/30 border border-white/5 rounded-2xl">
                <p className="text-gray-400 text-sm">
                  No preprints found. Try adjusting your search.
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {preprints.map((preprint) => (
                <div
                  key={preprint.id}
                  className={`transition-transform duration-150 ${
                    selectedPreprint?.id === preprint.id ? 'scale-[1.01]' : ''
                  }`}
                >
                  <PreprintCard
                    preprint={preprint}
                    isSelected={selectedPreprint?.id === preprint.id}
                    onClick={() => setSelectedPreprint(preprint)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right column: details – full width of its column */}
          <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
            <PreprintDetails
              preprint={selectedPreprint}
              adminKey={adminKey}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
        {/* ---------- END FIXED LAYOUT BLOCK ---------- */}
      </div>

      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} onSuccess={handleUploadSuccess} />
      )}
    </div>
  );
}

export default App;
