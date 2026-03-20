import { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useUI } from '../../context/UIContext';
import useGraphData from '../../hooks/useGraphData';
import paintNode from './NodeRenderer';
import paintLink from './LinkRenderer';
import GraphControls from './GraphControls';
import { GRAPH_CONFIG } from '../../utils/constants';
import type { GraphNode } from '../../db/types';

const GraphCanvas = () => {
  const graphRef = useRef<any>(null);
  const { setSelectedNodeId, setPanelMode, setBottomSheetOpen } = useUI();
  const graphData = useGraphData();

  const onNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    setPanelMode('view');
    setBottomSheetOpen(true);
  }, [setSelectedNodeId, setPanelMode, setBottomSheetOpen]);

  const onBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setPanelMode('empty');
    setBottomSheetOpen(false);
  }, [setSelectedNodeId, setPanelMode, setBottomSheetOpen]);

  return (
    <div className="w-full h-full relative">
      <GraphControls graphRef={graphRef} />
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={GRAPH_CONFIG.nodeCanvasObjectMode}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode='replace'
        warmupTicks={GRAPH_CONFIG.warmupTicks}
        cooldownTicks={GRAPH_CONFIG.cooldownTicks}
        d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
        d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
        minZoom={GRAPH_CONFIG.minZoom}
        maxZoom={GRAPH_CONFIG.maxZoom}
        onNodeClick={onNodeClick}
        onBackgroundClick={onBackgroundClick}
        backgroundColor='#030712'
      />
    </div>
  );
};

export default GraphCanvas;