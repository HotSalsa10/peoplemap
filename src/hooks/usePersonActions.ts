import { useState } from 'react';
import { addPerson, updatePerson, deletePerson } from '../db/personService';
import type { Person } from '../db/types';

export default function usePersonActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
    try {
      setError(null);
      setLoading(true);
      return await addPerson(data);
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, data: Partial<Omit<Person, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await updatePerson(id, data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await deletePerson(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, add, update, remove };
}