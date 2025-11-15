import { Calendar, Tag } from 'lucide-react';
import { Preprint } from '../api/preprints';

interface PreprintCardProps {
  preprint: Preprint;
  isSelected: boolean;
  onClick: () => void;
}

export default function PreprintCard({ preprint, isSelected, onClick }: PreprintCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-400/50 shadow-lg shadow-blue-500/20 scale-102'
          : 'glass-effect border-white/20 hover:border-blue-400/50'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/5 group-hover:to-blue-600/10 transition-all duration-300" />

      <div className="relative p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-base font-semibold text-white leading-tight flex-1 group-hover:text-blue-300 transition-colors">
            {preprint.title}
          </h3>
          {preprint.doi && (
            <span className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-2.5 py-1 rounded-full border border-green-500/30 whitespace-nowrap font-medium shadow-sm shadow-green-500/10">
              DOI
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
          {truncateText(preprint.abstract, 150)}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          {(preprint.course_code || preprint.category) && (
            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 group-hover:border-blue-400/30 group-hover:bg-blue-500/10 transition-all">
              <Tag className="w-3 h-3" />
              <span>{preprint.course_code || preprint.category.toUpperCase()}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(preprint.uploaded_at)}</span>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-transparent group-hover:h-1 transition-all duration-300 ${
        isSelected ? 'h-1' : ''
      }`} />
    </div>
  );
}
