import React from 'react';
import { useUI } from '../../context/UIContext';
import { resetDemoData, clearMePersonId } from '../../db/settingsService';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import Button from '../ui/Button';

const SettingsPanel: React.FC = () => {
  const { setPanelMode } = useUI();

  const meSetting = useLiveQuery(() => db.settings.get('mePersonId'));
  const mePerson = useLiveQuery(
    async () => {
      if (!meSetting) return undefined;
      return db.people.get(meSetting.value as number);
    },
    [meSetting]
  );

  const handleReset = async () => {
    await resetDemoData();
    window.location.reload();
  };

  const handleClearMe = async () => {
    await clearMePersonId();
  };

  return (
    <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
        <button onClick={() => setPanelMode('empty')} className="text-gray-400 hover:text-gray-200 text-xl">×</button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-300">Me node</h3>
        <p className="text-xs text-gray-500">
          {mePerson ? `Currently: ${mePerson.name}` : 'Not set — tap "Set as Me" on any person.'}
        </p>
        {mePerson && (
          <Button variant="secondary" onClick={handleClearMe}>
            Clear Me node
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-300">Demo data</h3>
        <p className="text-xs text-gray-500">Clears all data and reloads the demo people and relationships.</p>
        <Button variant="danger" onClick={handleReset}>
          Reset to demo data
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
