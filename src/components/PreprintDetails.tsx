import { useState } from 'react';
import {
  Calendar,
  Tag,
  User,
  BookOpen,
  FileText,
  ExternalLink,
  Download,
  X,
  Trash2,
} from 'lucide-react';
import { Preprint } from '../api/preprints';

const API_BASE =
  import.meta.env.VITE_API_URL?.toString().replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '');

interface PreprintDetailsProps {
  preprint: Preprint | null;
  adminKey?: string | null;
  onDeleted?: (id: number) => void;
}

export default function PreprintDetails({ preprint, adminKey, onDeleted }: PreprintDetailsProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!preprint) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            <FileText className="w-20 h-20 mx-auto text-gray-600 relative" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-400">Select a preprint</p>
            <p className="text-sm text-gray-500">Choose from the list to view details</p>
          </div>
        </div>
      </div>
    );
  }

  /** ✅ LOCAL DATE (NO TIME) */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /** ✅ ENSURE PDF URL IS HTTPS */
  const pdfUrl = preprint.pdf_file
    ? preprint.pdf_file.replace('http://', 'https://')
    : null;

  const handleDelete = async () => {
    if (!adminKey) return;
    const sure = window.confirm(
      `Delete "${preprint.title}"?\nThis will permanently remove the entry and its PDF.`
    );
    if (!sure) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE}/api/admin/preprints/${preprint.id}/`, {
        method: 'DELETE',
        headers: {
          'X-ADMIN-KEY': adminKey,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete preprint');
      }

      onDeleted?.(preprint.id);
      setShowPdfViewer(false);
    } catch (err: any) {
      alert(err?.message || 'Error deleting preprint');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="p-6 space-y-6 slide-in">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-100 bg-clip-text text-transparent leading-tight">
            {preprint.title}
          </h1>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs bg-gradient-to-r from-blue-500/30 to-blue-600/20 text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/40 font-medium shadow-sm shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              {preprint.category.toUpperCase()}
            </span>

            {preprint.doi && (
              <span className="text-xs bg-gradient-to-r from-green-500/30 to-emerald-600/20 text-green-200 px-3 py-1.5 rounded-full border border-green-500/40 font-medium shadow-sm shadow-green-500/10">
                DOI: {preprint.doi}
              </span>
            )}

            <span className="text-xs bg-gradient-to-r from-gray-600/30 to-gray-700/20 text-gray-200 px-3 py-1.5 rounded-full border border-gray-600/40 font-medium">
              v{preprint.version}
            </span>

            <span className="text-xs bg-gradient-to-r from-orange-500/30 to-amber-600/20 text-orange-200 px-3 py-1.5 rounded-full border border-orange-500/40 capitalize font-medium shadow-sm shadow-orange-500/10">
              {preprint.status}
            </span>

            {/* 🔐 Admin-only delete pill (top-rightish, subtle) */}
            {adminKey && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] text-red-200 bg-red-900/30 border border-red-500/40 hover:bg-red-900/50 hover:border-red-400/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Trash2 className="w-3 h-3" />
                {deleting ? 'Deleting…' : 'Delete preprint'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {preprint.authors && (
            <div className="glass-effect border-white/20 rounded-lg p-4 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group">
              <div className="flex items-center gap-2 text-blue-300 mb-2">
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Authors
                </span>
              </div>
              <p className="text-sm text-white">{preprint.authors}</p>
            </div>
          )}

          {preprint.faculty && (
            <div className="glass-effect border-white/20 rounded-lg p-4 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group">
              <div className="flex items-center gap-2 text-blue-300 mb-2">
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Faculty Guide
                </span>
              </div>
              <p className="text-sm text-white">{preprint.faculty}</p>
            </div>
          )}

          {preprint.course_code && (
            <div className="glass-effect border-white/20 rounded-lg p-4 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group">
              <div className="flex items-center gap-2 text-blue-300 mb-2">
                <Tag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Course Code
                </span>
              </div>
              <p className="text-sm text-white">{preprint.course_code}</p>
            </div>
          )}

          <div className="glass-effect border-white/20 rounded-lg p-4 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Uploaded
              </span>
            </div>
            <p className="text-sm text-white">{formatDate(preprint.uploaded_at)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Abstract
          </h2>
          <div className="glass-effect border-white/20 rounded-lg p-5 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {preprint.abstract}
            </p>
          </div>
        </div>

        {pdfUrl && (
          <div className="flex gap-3 sticky bottom-0 py-4 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent">
            <button
              onClick={() => setShowPdfViewer(true)}
              className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 button-press"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ExternalLink className="w-4 h-4 relative group-hover:rotate-12 transition-transform" />
              <span className="relative">View PDF</span>
            </button>

            <a
              href={pdfUrl}
              download
              className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-gray-900/50 hover:shadow-xl hover:shadow-gray-900/70 button-press"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Download className="w-4 h-4 relative group-hover:scale-110 transition-transform" />
              <span className="relative">Download</span>
            </a>
          </div>
        )}
      </div>

      {showPdfViewer && pdfUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 scale-in">
          <div className="glass-effect border-white/20 rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-transparent">
              <h3 className="font-semibold text-white">PDF Viewer</h3>
              <button
                onClick={() => setShowPdfViewer(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all button-press"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
