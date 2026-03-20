import React from 'react';
import { useUI } from '../../context/UIContext';
import Button from '../ui/Button';

const EmptyState: React.FC = () => {
  const { setPanelMode, setBottomSheetOpen } = useUI();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 flex-1 text-center">
      <p className="text-gray-500 text-sm">Click a node or search to explore your network</p>
      <Button
        variant="primary"
        onClick={() => {
          setPanelMode('addPerson');
          setBottomSheetOpen(true);
        }}
      >
        Add Person
      </Button>
    </div>
  );
};

export default EmptyState;