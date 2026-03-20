import React from 'react';
import { useUI } from '../../context/UIContext';
import SearchPanel from '../panels/SearchPanel';
import PersonDetail from '../panels/PersonDetail';
import PersonForm from '../panels/PersonForm';
import RelationshipForm from '../panels/RelationshipForm';
import EmptyState from '../panels/EmptyState';

const BottomSheet: React.FC = () => {
  const { bottomSheetOpen, panelMode, setBottomSheetOpen } = useUI();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 rounded-t-2xl transition-transform duration-300 ${
        bottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-2"></div>
      <button
        onClick={() => setBottomSheetOpen(false)}
        className="absolute top-3 right-3 text-white"
      >
        ×
      </button>
      <div className="max-h-[80vh] overflow-y-auto">
        <SearchPanel />
        {panelMode === 'view' && <PersonDetail />}
        {(panelMode === 'addPerson' || panelMode === 'editPerson') && <PersonForm />}
        {panelMode === 'addRelationship' && <RelationshipForm />}
        {panelMode === 'empty' && <EmptyState />}
      </div>
    </div>
  );
};

export default BottomSheet;