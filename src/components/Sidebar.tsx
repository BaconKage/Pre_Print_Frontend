import { FileText, Sparkles } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 glass-effect border-r flex flex-col hover:bg-white/7 duration-500">
      <div className="p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-center gap-3 mb-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg blur-lg opacity-60 group-hover:opacity-100" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
              RVU Preprints
            </h1>
          </div>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          University preprint server
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-white font-medium text-sm border border-blue-500/30 hover:from-blue-600/50 hover:to-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 group button-press">
          <FileText className="w-4 h-4 group-hover:rotate-12" />
          <span>All Preprints</span>
        </button>
      </nav>

      <div className="p-4 border-t border-white/10 bg-gradient-to-t from-blue-950/20 to-transparent">
        <p className="text-xs text-gray-500 text-center">Built for RVU internal papers</p>
      </div>
    </aside>
  );
}
