import { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useUI } from '../../context/UIContext';
import useGraphData from '../../hooks/useGraphData';
import paintNode from './NodeRenderer';
import paintLink from './LinkRenderer';
import { paintClusters } from './ClusterRenderer';
import GraphControls from './GraphControls';
import { GRAPH_CONFIG } from '../../utils/constants';

const GraphCanvas = () => {
  const graphRef = useRef<any>(null);
  const { setSelectedNodeId, setPanelMode, setBottomSheetOpen } = useUI();
  const { nodes, links, clusters } = useGraphData();

  const graphData = { nodes, links };

  // Center on "me" node after engine settles
  const onEngineStop = useCallback(() => {
    const meNode = nodes.find(n => n.isMe);
    if (meNode && graphRef.current) {
      graphRef.current.centerAt((meNode as any).x, (meNode as any).y, 800);
      graphRef.current.zoom(1.5, 800);
    }
  }, [nodes]);

  const onNodeClick = useCallback((node: any) => {
    setSelectedNodeId(node.id);
    setPanelMode('view');
    setBottomSheetOpen(true);
  }, [setSelectedNodeId, setPanelMode, setBottomSheetOpen]);

  const onBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    setPanelMode('empty');
    setBottomSheetOpen(false);
  }, [setSelectedNodeId, setPanelMode, setBottomSheetOpen]);

  const onRenderFramePre = useCallback((ctx: CanvasRenderingContext2D) => {
    if (nodes.length > 0) {
      paintClusters(clusters, nodes, ctx);
    }
  }, [clusters, nodes]);

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
        onRenderFramePre={onRenderFramePre}
        warmupTicks={GRAPH_CONFIG.warmupTicks}
        cooldownTicks={GRAPH_CONFIG.cooldownTicks}
        d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
        d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
        minZoom={GRAPH_CONFIG.minZoom}
        maxZoom={GRAPH_CONFIG.maxZoom}
        onNodeClick={onNodeClick}
        onBackgroundClick={onBackgroundClick}
        onEngineStop={onEngineStop}
        backgroundColor='#030712'
      />
    </div>
  );
};

export default GraphCanvas;
