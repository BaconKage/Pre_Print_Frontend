import { useState, useEffect } from 'react';
import { Search, Upload } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PreprintCard from './components/PreprintCard';
import PreprintDetails from './components/PreprintDetails';
import UploadModal from './components/UploadModal';
import { Preprint, fetchPreprints } from './api/preprints';

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
          className="text-red-400 hover:text-red-300 hover:underline"
        >
          Exit
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onLogin(value.trim());
          setValue('');
        }
      }}
    >
      <input
        type="password"
        placeholder="Admin key"
        className="glass-effect border-white/20 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 placeholder-gray-500 hover:border-white/40 transition-all"
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
  const [preprints, setPreprints] = useState<Preprint[]>([]);
  const [selectedPreprint, setSelectedPreprint] = useState<Preprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 🔐 secret admin key (for delete)
  const [adminKey, setAdminKey] = useState<string | null>(null);

  // Load admin key from localStorage (only on client)
  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('rvu_admin_key')
      : null;
    if (saved) setAdminKey(saved);
  }, []);

  const handleAdminLogin = (key: string) => {
    setAdminKey(key);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rvu_admin_key', key);
    }
  };

  const handleAdminLogout = () => {
    setAdminKey(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('rvu_admin_key');
    }
  };

  const loadPreprints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const data = await fetchPreprints(params);
      setPreprints(data);

      // keep selected preprint in sync if it still exists
      if (selectedPreprint) {
        const updated = data.find((p) => p.id === selectedPreprint.id) || null;
        setSelectedPreprint(updated);
      }
    } catch (err) {
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

  return (
    <div className="min-h-screen text-gray-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="glass-effect border-b border-white/10 px-6 py-4 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by title or abstract…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-effect border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/20 placeholder-gray-500 hover:border-white/40 transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-effect border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/20 hover:border-white/40 transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="cs">Computer Science</option>
              <option value="ai">AI / ML</option>
              <option value="math">Mathematics</option>
              <option value="physics">Physics</option>
            </select>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 button-press"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="w-4 h-4 relative group-hover:scale-110 transition-transform" />
              <span className="relative">Upload</span>
            </button>

            {/* 🔐 Secret admin UI – only useful if you know the ADMIN_SECRET */}
            <AdminLoginBox
              adminKey={adminKey}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
            />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-white/10 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="p-6 space-y-4">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-400">Loading preprints...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm fade-in">
                  {error}
                </div>
              )}

              {!loading && !error && preprints.length === 0 && (
                <div className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-gray-600 text-4xl">∅</div>
                    <p className="text-gray-400">No preprints found</p>
                    <p className="text-xs text-gray-500">Try adjusting your search filters</p>
                  </div>
                </div>
              )}

              {!loading && !error && preprints.map((preprint, idx) => (
                <div
                  key={preprint.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="animate-[slideIn_0.4s_ease-out_forwards]"
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

          <div className="w-1/2 overflow-y-auto">
            <PreprintDetails
              preprint={selectedPreprint}
              adminKey={adminKey}
              onDeleted={handleDeleted}
            />
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

export default App;
