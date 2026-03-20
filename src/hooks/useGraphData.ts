import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getColorFromString } from '../utils/colors';
import type { GraphData, GraphNode, GraphLink } from '../db/types';

export default function useGraphData(): GraphData {
  const result = useLiveQuery(() => Promise.all([
    db.people.toArray(),
    db.relationships.toArray()
  ]), []);

  const people = result?.[0];
  const relationships = result?.[1];

  if (!people || !relationships) {
    return { nodes: [], links: [] };
  }

  const relationshipCountMap = new Map<number, number>();
  relationships.forEach((relationship) => {
    relationshipCountMap.set(relationship.sourceId, (relationshipCountMap.get(relationship.sourceId) || 0) + 1);
    relationshipCountMap.set(relationship.targetId, (relationshipCountMap.get(relationship.targetId) || 0) + 1);
  });

  const nodes: GraphNode[] = people
    .filter((person) => person.id !== undefined)
    .map((person) => ({
      id: person.id!,
      name: person.name,
      nickname: person.nickname,
      tags: person.tags,
      color: getColorFromString(person.name),
      val: Math.max(1, relationshipCountMap.get(person.id!) || 0),
    }));

  const links: GraphLink[] = relationships.map((relationship) => ({
    source: relationship.sourceId,
    target: relationship.targetId,
    label: relationship.label,
    strength: relationship.strength
  }));

  return { nodes, links };
}