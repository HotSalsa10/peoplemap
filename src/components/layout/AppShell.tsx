import React from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import BottomSheet from './BottomSheet';
import FAB from './FAB';
import GraphCanvas from '../graph/GraphCanvas';

const AppShell: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <>
      {isMobile ? (
        <div className="relative h-screen bg-gray-950">
          <GraphCanvas />
          <FAB />
          <BottomSheet />
        </div>
      ) : (
        <div className="flex h-screen bg-gray-950">
          <Sidebar />
          <div className="flex-1 relative">
            <GraphCanvas />
          </div>
        </div>
      )}
    </>
  );
};

export default AppShell;