import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useUI } from '../../context/UIContext';
import usePersonActions from '../../hooks/usePersonActions';
import { setMePersonId } from '../../db/settingsService';
import TagBadge from '../ui/TagBadge';
import Button from '../ui/Button';
import type { Relationship } from '../../db/types';

const PersonDetail: React.FC = () => {
  const { selectedNodeId, setPanelMode, setSelectedNodeId } = useUI();
  const { remove } = usePersonActions();

  const person = useLiveQuery(
    () => selectedNodeId ? db.people.get(selectedNodeId) : undefined,
    [selectedNodeId]
  );

  const relationships = useLiveQuery(
    async () => selectedNodeId
      ? db.relationships.where('sourceId').equals(selectedNodeId).or('targetId').equals(selectedNodeId).toArray()
      : Promise.resolve([] as Relationship[]),
    [selectedNodeId]
  );

  const meSetting = useLiveQuery(() => db.settings.get('mePersonId'));
  const isMe = meSetting?.value === selectedNodeId;

  if (!person) {
    return null;
  }

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
      <h2 className="text-xl font-semibold text-gray-100">{person.name}</h2>
      {person.nickname && (
        <p className="text-gray-400 text-sm">{person.nickname}</p>
      )}
      {person.notes && <p className="text-gray-300 text-sm">{person.notes}</p>}
      <div className="flex gap-2">
        {person.tags.map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <p className="text-gray-400 text-sm">{relationships?.length ?? 0} connections</p>
      <div className="flex gap-2">
        <Button onClick={() => setPanelMode('editPerson')} variant="secondary">
          Edit
        </Button>
        <Button
          onClick={() => setPanelMode('addRelationship')}
          variant="secondary"
        >
          Add Connection
        </Button>
        <Button
          variant="secondary"
          onClick={async () => { if (selectedNodeId) await setMePersonId(selectedNodeId); }}
        >
          {isMe ? 'You ✓' : 'Set as Me'}
        </Button>
        <Button
          onClick={async () => {
            await remove(selectedNodeId!);
            setSelectedNodeId(null);
            setPanelMode('empty');
          }}
          variant="danger"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PersonDetail;