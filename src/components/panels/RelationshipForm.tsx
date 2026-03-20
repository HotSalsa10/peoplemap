import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import useRelationshipActions from '../../hooks/useRelationshipActions';
import PersonPicker from '../ui/PersonPicker';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RelationshipForm: React.FC = () => {
  const { selectedNodeId, setPanelMode } = useUI();
  const { add } = useRelationshipActions();

  const [targetId, setTargetId] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [context, setContext] = useState('');
  const [strength, setStrength] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId && label) {
      await add({ sourceId: selectedNodeId!, targetId, label, context, strength });
      setPanelMode('view');
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
      <h2>Add Connection</h2>
      <PersonPicker
        label="Connect to"
        exclude={[selectedNodeId!]}
        onChange={setTargetId}
      />
      <Input
        label="Label"
        placeholder="friend, coworker, sibling..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <Input
        label="Context"
        placeholder="How do you know them?"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <span>Strength: {strength}</span>
        <input
          type="range"
          min="1"
          max="5"
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setPanelMode('view')}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!targetId || !label} onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default RelationshipForm;