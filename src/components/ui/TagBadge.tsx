import React from 'react';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-200">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="text-indigo-300 hover:text-white">
          ×
        </button>
      )}
    </span>
  );
};

export default TagBadge;