export const MOBILE_BREAKPOINT = 768;

export const GRAPH_CONFIG = {
  warmupTicks: 100,
  cooldownTicks: 200,
  d3AlphaDecay: 0.03,
  d3VelocityDecay: 0.4,
  nodeRelSize: 4,
  minZoom: 0.1,
  maxZoom: 8,
  nodeCanvasObjectMode: 'replace' as const,
};

export const LOD_THRESHOLDS = {
  labelsAll: 1.5,
  labelsConnected: 0.5,
};

export const SEARCH_LIMIT = 50;
export const SEARCH_DEBOUNCE_MS = 300;
