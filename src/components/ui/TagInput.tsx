import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import TagBadge from './TagBadge';

interface Props {
  tags: string[];
  onChange(tags: string[]): void;
  placeholder?: string;
}

const TagInput = ({ tags, onChange, placeholder }: Props) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-800 border border-gray-700 rounded-md">
      {tags.map((tag) => (
        <TagBadge key={tag} tag={tag} onRemove={() => onChange(tags.filter((t) => t !== tag))} />
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500 min-w-24"
      />
    </div>
  );
};

export default TagInput;