import { useState, FormEvent } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { uploadPreprint, Preprint } from '../api/preprints';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (preprint: Preprint) => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    faculty: '',
    courseCode: '',
    // 🔹 Default category
    category: 'FDS',
    abstract: '',
    mintDoi: false,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pdfFile) {
      setError('Please select a PDF file');
      return;
    }

    if (!formData.title.trim() || !formData.abstract.trim()) {
      setError('Title and abstract are required');
      return;
    }

    setUploading(true);

    try {
      const newPreprint = await uploadPreprint({
        ...formData,
        pdfFile,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(newPreprint);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 scale-in">
      <div className="glass-effect border-white/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between bg-gradient-to-r from-gray-900/90 to-transparent">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">Upload Preprint</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all button-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center space-y-4 scale-in">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
              <CheckCircle className="w-16 h-16 text-green-400 relative" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Upload Successful!</h3>
              <p className="text-gray-400">Your preprint has been uploaded successfully.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm backdrop-blur-sm fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow placeholder-gray-500"
                placeholder="Enter preprint title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Authors
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow placeholder-gray-500"
                  placeholder="Student1, Student2"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Faculty Guide
                </label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow placeholder-gray-500"
                  placeholder="Faculty name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow placeholder-gray-500"
                  placeholder="e.g., FDS, FDE"
                />
              </div>

              {/* 🔹 Updated Category only */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow [&>option]:bg-gray-900 [&>option]:text-white"
                >
                  <option value="FDS">Data Science</option>
                  <option value="FDE">Data Engineering</option>
                  <option value="TOC">Theory of Computation</option>
                  <option value="OS">Operating Systems</option>
                  <option value="CN">Computer Networks</option>
                  <option value="ML">Machine Learning</option>
                  <option value="CS">Cyber Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* 🔹 End Category */}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Abstract <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                rows={5}
                className="w-full glass-effect border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 input-glow resize-none placeholder-gray-500"
                placeholder="Enter preprint abstract"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                PDF File <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  required
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center justify-center gap-3 w-full glass-effect border-2 border-dashed border-white/20 group-hover:border-blue-400/50 rounded-lg px-4 py-6 cursor-pointer transition-all group-hover:bg-blue-500/5"
                >
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors group-hover:scale-110" />
                  <span
                    className={`${
                      pdfFile ? 'text-green-400 font-medium' : 'text-gray-400'
                    } transition-colors`}
                  >
                    {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 glass-effect border-white/20 rounded-lg hover:bg-blue-500/5 transition-all group cursor-pointer">
              <input
                type="checkbox"
                id="mint-doi"
                checked={formData.mintDoi}
                onChange={(e) => setFormData({ ...formData, mintDoi: e.target.checked })}
                className="w-4 h-4 rounded border-white/30 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="mint-doi"
                className="text-sm text-gray-300 cursor-pointer flex-1 group-hover:text-gray-200 transition-colors"
              >
                Mint fake DOI for this upload
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 group relative overflow-hidden rounded-lg glass-effect border-white/20 hover:border-white/40 text-white px-4 py-3 font-semibold transition-all button-press"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Cancel</span>
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white px-4 py-3 font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 flex items-center justify-center gap-2 button-press"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative" />
                    <span className="relative">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 relative group-hover:scale-110 transition-transform" />
                    <span className="relative">Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
