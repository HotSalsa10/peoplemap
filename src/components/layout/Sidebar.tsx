import React from 'react';
import { useUI } from '../../context/UIContext';
import SearchPanel from '../panels/SearchPanel';
import PersonDetail from '../panels/PersonDetail';
import PersonForm from '../panels/PersonForm';
import RelationshipForm from '../panels/RelationshipForm';
import EmptyState from '../panels/EmptyState';

const Sidebar: React.FC = () => {
  const { panelMode } = useUI();

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      <SearchPanel />
      {panelMode === 'view' && <PersonDetail />}
      {(panelMode === 'addPerson' || panelMode === 'editPerson') && (
        <PersonForm />
      )}
      {panelMode === 'addRelationship' && <RelationshipForm />}
      {panelMode === 'empty' && <EmptyState />}
    </div>
  );
};

export default Sidebar;