import React from 'react';
import { useUI } from '../../context/UIContext';

const FAB: React.FC = () => {
  const { setPanelMode, setBottomSheetOpen } = useUI();

  return (
    <button
      onClick={() => {
        setPanelMode('addPerson');
        setBottomSheetOpen(true);
      }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl shadow-lg flex items-center justify-center transition-colors"
    >
      +
    </button>
  );
};

export default FAB;