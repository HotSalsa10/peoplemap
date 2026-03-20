import { db } from './database';
import type { Person } from './types';

export const addPerson = async (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const timestamp = Date.now();
  return db.people.add({ ...data, createdAt: timestamp, updatedAt: timestamp });
};

export const updatePerson = async (id: number, data: Partial<Omit<Person, 'id' | 'createdAt'>>): Promise<void> => {
  await db.people.update(id, { ...data, updatedAt: Date.now() });
};

export const deletePerson = async (id: number): Promise<void> => {
  await db.transaction('rw', [db.people, db.relationships], async () => {
    const relIds = await db.relationships
      .where('sourceId').equals(id)
      .or('targetId').equals(id)
      .primaryKeys();
    await db.relationships.bulkDelete(relIds as number[]);
    await db.people.delete(id);
  });
};

export const getPersonById = async (id: number): Promise<Person | undefined> => {
  return db.people.get(id);
};

export const getAllPeople = async (): Promise<Person[]> => {
  return db.people.toArray();
};