
import Dexie, { type Table } from 'dexie';
import type { Person, Relationship } from './types';

class PeopleMapDB extends Dexie {


  people!: Table<Person, number>;
  relationships!: Table<Relationship, number>;

  constructor() {
    super('PeopleMapDB');
    this.version(1).stores({
      people: '++id, name, *tags, createdAt',
      relationships: '++id, sourceId, targetId, [sourceId+targetId]'
    });
  }
}

export const db = new PeopleMapDB();