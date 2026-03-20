import { useEffect } from 'react';
import { UIProvider, useUI } from './context/UIContext';
import AppShell from './components/layout/AppShell';
import { seedDatabase } from './db/seedData';

function KeyboardShortcuts() {
  const { setSelectedNodeId, setPanelMode, setSearchQuery, setBottomSheetOpen } = useUI();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setPanelMode('empty');
        setBottomSheetOpen(false);
      }
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchQuery('');
        const input = document.querySelector<HTMLInputElement>('input[type="search"]');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSelectedNodeId, setPanelMode, setBottomSheetOpen, setSearchQuery]);
  return null;
}

export default function App() {
  useEffect(() => { seedDatabase(); }, []);
  return (
    <UIProvider>
      <KeyboardShortcuts />
      <AppShell />
    </UIProvider>
  );
}
