import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PanelMode, UIState } from '../db/types';

export type { PanelMode, UIState };

interface UIContextValue extends UIState {
  setSelectedNodeId(id: number | null): void;
  setPanelMode(mode: PanelMode): void;
  setSearchQuery(q: string): void;
  setModalOpen(open: boolean): void;
  setBottomSheetOpen(open: boolean): void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);

  return (
    <UIContext.Provider
      value={{
        selectedNodeId,
        panelMode,
        searchQuery,
        modalOpen,
        bottomSheetOpen,
        setSelectedNodeId,
        setPanelMode,
        setSearchQuery,
        setModalOpen,
        setBottomSheetOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};