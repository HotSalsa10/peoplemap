import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getColorFromString, getLighterShade } from '../utils/colors';
import type { GraphData, GraphNode, GraphLink, ClusterData } from '../db/types';

function buildClusters(nodes: GraphNode[]): ClusterData[] {
  // Collect all unique tags
  const allTags = Array.from(new Set(nodes.flatMap(n => n.tags)));

  // Determine parent/child relationships
  const clusters: ClusterData[] = allTags.map(tag => {
    const parentTag = allTags.find(
      other => other !== tag && tag.toLowerCase().includes(other.toLowerCase())
    ) ?? null;
    const color = getColorFromString(tag);
    return {
      tag,
      parentTag,
      color,
      lighterColor: getLighterShade(color),
      nodeIds: nodes.filter(n => n.tags.includes(tag)).map(n => n.id),
    };
  });

  return clusters.filter(c => c.nodeIds.length > 0);
}

export interface GraphDataWithClusters extends GraphData {
  clusters: ClusterData[];
}

export default function useGraphData(): GraphDataWithClusters {
  const result = useLiveQuery(() => Promise.all([
    db.people.toArray(),
    db.relationships.toArray(),
    db.settings.get('mePersonId'),
  ]), []);

  const people = result?.[0];
  const relationships = result?.[1];
  const meSetting = result?.[2];
  const mePersonId = meSetting ? (meSetting.value as number) : null;

  if (!people || !relationships) {
    return { nodes: [], links: [], clusters: [] };
  }

  const relationshipCountMap = new Map<number, number>();
  relationships.forEach((rel) => {
    relationshipCountMap.set(rel.sourceId, (relationshipCountMap.get(rel.sourceId) || 0) + 1);
    relationshipCountMap.set(rel.targetId, (relationshipCountMap.get(rel.targetId) || 0) + 1);
  });

  const nodes: GraphNode[] = people
    .filter(p => p.id !== undefined)
    .map(p => ({
      id: p.id!,
      name: p.name,
      nickname: p.nickname,
      tags: p.tags,
      color: getColorFromString(p.name),
      val: Math.max(1, relationshipCountMap.get(p.id!) || 0),
      isMe: p.id === mePersonId,
    }));

  const links: GraphLink[] = relationships.map(rel => ({
    source: rel.sourceId,
    target: rel.targetId,
    label: rel.label,
    strength: rel.strength,
  }));

  const clusters = buildClusters(nodes);

  return { nodes, links, clusters };
}
