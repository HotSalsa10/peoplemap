import React from 'react';
import { useUI } from '../../context/UIContext';
import useSearch from '../../hooks/useSearch';

const SearchPanel: React.FC = () => {
  const { searchQuery, setSearchQuery, setSelectedNodeId, setPanelMode, setBottomSheetOpen } = useUI();
  const results = useSearch(searchQuery);

  return (
    <div className="p-3 border-b border-gray-800">
      <input
        type='search'
        placeholder='Search people...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
      {searchQuery && results.length > 0 && (
        <div>
          {results.map((person) => (
            <div
              key={person.id}
              className="px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                setSelectedNodeId(person.id!);
                setPanelMode('view');
                setSearchQuery('');
                setBottomSheetOpen(true);
              }}
            >
              {person.name} <span className="text-gray-500">({person.tags.join(', ')})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;