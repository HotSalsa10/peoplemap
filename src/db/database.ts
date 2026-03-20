
import Dexie, { type Table } from 'dexie';
import type { Person, Relationship } from './types';

export interface Setting {
  key: string;
  value: unknown;
}

class PeopleMapDB extends Dexie {
  people!: Table<Person, number>;
  relationships!: Table<Relationship, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('PeopleMapDB');
    this.version(1).stores({
      people: '++id, name, *tags, createdAt',
      relationships: '++id, sourceId, targetId, [sourceId+targetId]'
    });
    this.version(2).stores({
      people: '++id, name, *tags, createdAt',
      relationships: '++id, sourceId, targetId, [sourceId+targetId]',
      settings: 'key'
    });
  }
}

export const db = new PeopleMapDB();