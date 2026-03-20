import { db } from './database';
import type { Person, Relationship } from './types';

export interface DatabaseExport {
  version: number;
  exportedAt: number;
  people: Person[];
  relationships: Relationship[];
}

export async function exportDatabase(): Promise<void> {
  const [people, relationships] = await Promise.all([
    db.people.toArray(),
    db.relationships.toArray()
  ]);

  const data: DatabaseExport = {
    version: 1,
    exportedAt: Date.now(),
    people,
    relationships
  };

  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'peoplemap-export.json';
  a.click();

  URL.revokeObjectURL(url);
}

export async function importDatabase(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data || !Array.isArray(data.people) || !Array.isArray(data.relationships)) {
    throw new Error('Invalid import file');
  }

  return db.transaction('rw', [db.people, db.relationships], async () => {
    await db.people.clear();
    await db.relationships.clear();

    await db.people.bulkPut(data.people);
    await db.relationships.bulkPut(data.relationships);
  });
}