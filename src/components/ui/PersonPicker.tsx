import React, { useState } from 'react';
import useSearch from '../../hooks/useSearch';

interface PersonPickerProps {
  onChange(personId: number): void;
  label?: string;
  exclude?: number[];
}

const PersonPicker: React.FC<PersonPickerProps> = ({ onChange, label, exclude }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchResults = useSearch(query);

  return (
    <div className="relative">
      {label && (
        <label className="text-sm text-gray-400 mb-1 block">{label}</label>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search people..."
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
      {isFocused && query && (
        <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto">
          {searchResults
            .filter((person) => person.id !== undefined && !exclude?.includes(person.id))
            .map((person) => (
              <div
                key={person.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(person.id!);
                  setQuery(person.name);
                  setIsFocused(false);
                }}
                className="px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 cursor-pointer"
              >
                {person.name}
                {person.nickname && (
                  <span className="text-gray-400 ml-1">({person.nickname})</span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PersonPicker;
