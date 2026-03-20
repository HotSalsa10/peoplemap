import { db } from './database';
import { seedDatabase } from './seedData';

export const getMePersonId = async (): Promise<number | null> => {
  const setting = await db.settings.get('mePersonId');
  return setting ? (setting.value as number) : null;
};

export const setMePersonId = async (id: number): Promise<void> => {
  await db.settings.put({ key: 'mePersonId', value: id });
};

export const clearMePersonId = async (): Promise<void> => {
  await db.settings.delete('mePersonId');
};

export const resetDemoData = async (): Promise<void> => {
  await db.transaction('rw', [db.people, db.relationships, db.settings], async () => {
    await db.people.clear();
    await db.relationships.clear();
    await db.settings.clear();
  });
  await seedDatabase();
};
