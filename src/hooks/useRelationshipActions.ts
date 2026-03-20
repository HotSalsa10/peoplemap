import { useState } from 'react';
import { addRelationship, updateRelationship, deleteRelationship } from '../db/relationshipService';
import type { Relationship } from '../db/types';

export default function useRelationshipActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> {
    setLoading(true);
    setError(null);

    try {
      const id = await addRelationship(data);
      return id;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: number, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await updateRelationship(id, data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      await deleteRelationship(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, add, update, remove };
}