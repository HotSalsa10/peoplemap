import { db } from './database';
import type { Relationship } from './types';

export const addRelationship = async (data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const now = Date.now();
  return await db.relationships.add({ ...data, createdAt: now, updatedAt: now });
};

export const updateRelationship = async (id: number, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>): Promise<void> => {
  const now = Date.now();
  await db.relationships.update(id, { ...data, updatedAt: now });
};

export const deleteRelationship = async (id: number): Promise<void> => {
  await db.relationships.delete(id);
};

export const getRelationshipsForPerson = async (personId: number): Promise<Relationship[]> => {
  return await db.relationships.where('sourceId').equals(personId).or('targetId').equals(personId).toArray();
};