import React from 'react';
import { useUI } from '../../context/UIContext';
import SearchPanel from '../panels/SearchPanel';
import PersonDetail from '../panels/PersonDetail';
import PersonForm from '../panels/PersonForm';
import RelationshipForm from '../panels/RelationshipForm';
import EmptyState from '../panels/EmptyState';
import SettingsPanel from '../panels/SettingsPanel';

const Sidebar: React.FC = () => {
  const { panelMode, setPanelMode } = useUI();

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PeopleMap</span>
        <button
          onClick={() => setPanelMode('settings')}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          title="Settings"
        >
          ⚙
        </button>
      </div>
      <SearchPanel />
      {panelMode === 'view' && <PersonDetail />}
      {(panelMode === 'addPerson' || panelMode === 'editPerson') && <PersonForm />}
      {panelMode === 'addRelationship' && <RelationshipForm />}
      {panelMode === 'settings' && <SettingsPanel />}
      {panelMode === 'empty' && <EmptyState />}
    </div>
  );
};

export default Sidebar;
