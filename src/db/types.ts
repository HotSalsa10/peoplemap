// All TypeScript interfaces and type aliases for PeopleMap

export interface Person {
  id?: number;
  name: string;
  nickname?: string;
  notes?: string;
  tags: string[];
  avatarColor?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id?: number;
  sourceId: number;
  targetId: number;
  label: string;
  context?: string;
  strength: number; // 1-5
  createdAt: number;
  updatedAt: number;
}

export interface GraphNode {
  id: number;
  name: string;
  nickname?: string;
  tags: string[];
  color: string;
  val: number; // node size = relationship count
  isMe?: boolean;
}

export interface GraphLink {
  source: number;
  target: number;
  label: string;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ClusterData {
  tag: string;
  parentTag: string | null;
  color: string;
  lighterColor: string;
  nodeIds: number[];
}

export type PanelMode =
  | 'empty'
  | 'view'
  | 'addPerson'
  | 'editPerson'
  | 'addRelationship'
  | 'settings';

export interface UIState {
  selectedNodeId: number | null;
  panelMode: PanelMode;
  searchQuery: string;
  modalOpen: boolean;
  bottomSheetOpen: boolean;
}
