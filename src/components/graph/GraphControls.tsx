import React from 'react';
import Button from '../ui/Button';

interface GraphControlsProps {
  graphRef: React.RefObject<any>;
}

const GraphControls: React.FC<GraphControlsProps> = ({ graphRef }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <Button variant="secondary" size="sm" onClick={() => graphRef.current?.zoomToFit(400)}>
        Fit
      </Button>
      <Button variant="secondary" size="sm" onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}>
        +
      </Button>
      <Button variant="secondary" size="sm" onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)}>
        −
      </Button>
    </div>
  );
};

export default GraphControls;