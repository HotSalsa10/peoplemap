import { useState, useEffect } from 'react';
import { db } from '../db/database';
import type { Person } from '../db/types';

export default function useSearch(query: string): Person[] {
  const [results, setResults] = useState<Person[]>([]);

  useEffect(() => {
    if (query === '') {
      setResults([]);
      return;
    }

    const debouncedQuery = setTimeout(async () => {
      const peopleByName = await db.people.where('name').startsWithIgnoreCase(query).limit(50).toArray();
      const peopleByTag = await db.people.where('tags').anyOfIgnoreCase([query]).limit(50).toArray();

      const mergedResults = [...peopleByName, ...peopleByTag];
      const seen = new Set<number>();
      const uniqueResults = mergedResults.filter(p => {
        if (p.id === undefined || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      setResults(uniqueResults.slice(0, 50));
    }, 300);

    return () => clearTimeout(debouncedQuery);
  }, [query]);

  return results;
}