import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useUI } from '../../context/UIContext';
import usePersonActions from '../../hooks/usePersonActions';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import TagInput from '../ui/TagInput';
import Button from '../ui/Button';

const PersonForm = () => {
  const { panelMode, selectedNodeId, setPanelMode } = useUI();
  const isEdit = panelMode === 'editPerson';
  const { update, add } = usePersonActions();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Load the existing person if in edit mode
  const existingPerson = useLiveQuery(
    () => isEdit ? db.people.get(selectedNodeId!) : undefined,
    [isEdit, selectedNodeId]
  );

  useEffect(() => {
    if (existingPerson) {
      setName(existingPerson.name);
      setNickname(existingPerson.nickname || '');
      setNotes(existingPerson.notes || '');
      setTags(existingPerson.tags || []);
    }
  }, [existingPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const personData = { name, nickname, notes, tags };

    if (isEdit) {
      await update(selectedNodeId!, personData);
    } else {
      await add(personData);
    }

    setPanelMode('empty');
  };

  return (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
      <h2>{isEdit ? 'Edit Person' : 'Add Person'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <TextArea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Tags</label>
          <TagInput
            tags={tags}
            onChange={setTags}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPanelMode('empty')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonForm;