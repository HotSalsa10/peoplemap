import { db } from './database';

export async function seedDatabase(): Promise<void> {
  // Only seed the database if it's empty
  const peopleCount = await db.people.count();
  if (peopleCount > 0) return;

  // Create 10 realistic people with varied names, nicknames, and tags
  const people = [
    { name: 'John Doe', nickname: 'Johnny', tags: ['work'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Jane Smith', nickname: 'Jenny', tags: ['college'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Mike Johnson', nickname: 'Mikie', tags: ['family'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Emily Davis', nickname: 'Emmy', tags: ['friends'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Chris Brown', nickname: 'Chrisy', tags: ['work', 'college'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Samantha Green', nickname: 'Sammy', tags: ['family', 'friends'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Alex White', nickname: 'Lexi', tags: ['college', 'friends'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Lily Black', nickname: 'Lilly', tags: ['work', 'family'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Noah Blue', nickname: 'Nook', tags: ['friends'], createdAt: Date.now(), updatedAt: Date.now() },
    { name: 'Olivia Red', nickname: 'Ollie', tags: ['college', 'work'], createdAt: Date.now(), updatedAt: Date.now() }
  ];

  // Add people to the database and capture generated IDs
  const ids = await db.people.bulkAdd(people, { allKeys: true }) as number[];

  // Create 12 relationships between them with varied labels and strengths
  const relationships = [
    { sourceId: ids[0], targetId: ids[2], label: 'coworker', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[0], targetId: ids[5], label: 'mentor', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[1], targetId: ids[6], label: 'friend', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[1], targetId: ids[7], label: 'sibling', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[2], targetId: ids[3], label: 'coworker', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[3], targetId: ids[8], label: 'friend', strength: 2, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[4], targetId: ids[9], label: 'coworker', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[5], targetId: ids[6], label: 'sibling', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[6], targetId: ids[7], label: 'friend', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[7], targetId: ids[8], label: 'coworker', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[8], targetId: ids[9], label: 'mentor', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
    { sourceId: ids[9], targetId: ids[0], label: 'friend', strength: 4, createdAt: Date.now(), updatedAt: Date.now() }
  ];

  // Add relationships to the database
  await db.relationships.bulkAdd(relationships);
}