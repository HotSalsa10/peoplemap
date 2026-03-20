# PeopleMap Bug Fix & Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all runtime/TypeScript bugs in the existing 38-file codebase and deploy to Vercel so the app is accessible as a PWA on iPhone.

**Architecture:** All bugs are isolated to individual files — no cross-cutting refactors needed. Fix in dependency order (services → hooks → components → layout). Then init git and deploy via Vercel CLI.

**Tech Stack:** React 19, TypeScript strict, Dexie.js v4, react-force-graph-2d, Tailwind CSS v4, vite-plugin-pwa, Vercel CLI (pnpm i -g vercel)

---

## Bug Inventory (complete list found by audit)

| File | Bug |
|------|-----|
| `src/db/relationshipService.ts` | Re-declares `Relationship` interface (already imported from types.ts) |
| `src/db/seedData.ts` | Uses `personId`/`relatedPersonId` fields — should be `sourceId`/`targetId` |
| `src/hooks/usePersonActions.ts` | `err.message` on `unknown` type (strict TS) |
| `src/hooks/useRelationshipActions.ts` | Same |
| `src/components/layout/BottomSheet.tsx` | Uses wrong panelMode strings (`'search'`, `'personDetail'`, `'personForm'`, `'relationshipForm'`, `'emptyState'`) |
| `src/components/panels/PersonDetail.tsx` | Missing deps on both `useLiveQuery` calls; `relationships.length` crashes when undefined |
| `src/components/panels/PersonForm.tsx` | `useState([])` infers `never[]`; uses boolean `primary`/`secondary` props instead of `variant=`; `onTagsChange` → `onChange` on TagInput |
| `src/components/panels/RelationshipForm.tsx` | Input `onChange` passes setter directly instead of event handler; Button boolean props instead of `variant=` |
| `src/components/ui/PersonPicker.tsx` | Re-declares `Person` interface (already imported); missing `React` import; broken input value (shows selected name, ignores typed query); `onChange` signature mismatch with RelationshipForm |
| `src/components/layout/FAB.tsx` | Uses `React.FC` but missing `import React from 'react'` |
| `src/components/panels/EmptyState.tsx` | Uses `React.FC` but missing `import React from 'react'` |

---

## Task 1: Fix data layer bugs

**Files:**
- Modify: `src/db/relationshipService.ts`
- Modify: `src/db/seedData.ts`
- Modify: `src/hooks/usePersonActions.ts`
- Modify: `src/hooks/useRelationshipActions.ts`

- [ ] **Step 1: Fix `relationshipService.ts` — remove duplicate interface**

Remove lines 4–13 (the re-declared `Relationship` interface). The import on line 2 already brings it in.

Final file:
```ts
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
```

- [ ] **Step 2: Fix `seedData.ts` — correct relationship field names**

Change `personId` → `sourceId` and `relatedPersonId` → `targetId` in all 12 relationship objects.

Final relationships array:
```ts
const relationships = [
  { sourceId: 1, targetId: 3, label: 'coworker', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 1, targetId: 6, label: 'mentor', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 2, targetId: 7, label: 'friend', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 2, targetId: 8, label: 'sibling', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 3, targetId: 4, label: 'coworker', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 4, targetId: 9, label: 'friend', strength: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 5, targetId: 10, label: 'coworker', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 6, targetId: 7, label: 'sibling', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 7, targetId: 8, label: 'friend', strength: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 8, targetId: 9, label: 'coworker', strength: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 9, targetId: 10, label: 'mentor', strength: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { sourceId: 10, targetId: 1, label: 'friend', strength: 4, createdAt: Date.now(), updatedAt: Date.now() }
];
```

- [ ] **Step 3: Fix `usePersonActions.ts` — `err.message` on unknown**

In all three catch blocks, change `err.message` to `(err as Error).message`.

- [ ] **Step 4: Fix `useRelationshipActions.ts` — same**

In all three catch blocks, change `err.message` to `(err as Error).message`.

- [ ] **Step 5: Verify build still passes**

```bash
cd C:\Users\smsh3\Desktop\PeopleMap && npm run build
```
Expected: no TypeScript errors in these files.

---

## Task 2: Fix BottomSheet panelMode strings

**Files:**
- Modify: `src/components/layout/BottomSheet.tsx`

The `PanelMode` type is: `'empty' | 'view' | 'addPerson' | 'editPerson' | 'addRelationship'`

The current BottomSheet checks nonexistent values. It should mirror exactly what Sidebar does, plus show SearchPanel always (not conditionally).

- [ ] **Step 1: Fix the panel content section of BottomSheet**

Replace **only** lines 26–31 (the `<div className="max-h-[80vh]...">` block). Keep the drag handle (line 18) and close button (lines 19–23) unchanged.

Change from:
```tsx
      <div className="max-h-[80vh] overflow-y-auto">
        {panelMode === 'search' && <SearchPanel />}
        {panelMode === 'personDetail' && <PersonDetail />}
        {panelMode === 'personForm' && <PersonForm />}
        {panelMode === 'relationshipForm' && <RelationshipForm />}
        {panelMode === 'emptyState' && <EmptyState />}
      </div>
```

To:
```tsx
      <div className="max-h-[80vh] overflow-y-auto">
        <SearchPanel />
        {panelMode === 'view' && <PersonDetail />}
        {(panelMode === 'addPerson' || panelMode === 'editPerson') && <PersonForm />}
        {panelMode === 'addRelationship' && <RelationshipForm />}
        {panelMode === 'empty' && <EmptyState />}
      </div>
```

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: no errors in BottomSheet.

---

## Task 3: Fix PersonDetail

**Files:**
- Modify: `src/components/panels/PersonDetail.tsx`

- [ ] **Step 1: Add deps to both useLiveQuery calls**

Replace lines 13–24 (both `useLiveQuery` calls):
```tsx
const person = useLiveQuery(
  () => selectedNodeId ? db.people.get(selectedNodeId) : null,
  [selectedNodeId]
);

const relationships = useLiveQuery(
  () => selectedNodeId
    ? db.relationships.where('sourceId').equals(selectedNodeId).or('targetId').equals(selectedNodeId).toArray()
    : Promise.resolve([]),
  [selectedNodeId]
);
```

- [ ] **Step 2: Guard `relationships.length` against undefined**

Replace (line 42):
```tsx
      <p className="text-gray-400 text-sm">{relationships.length} connections</p>
```
With:
```tsx
      <p className="text-gray-400 text-sm">{relationships?.length ?? 0} connections</p>
```

---

## Task 4: Fix PersonForm

**Files:**
- Modify: `src/components/panels/PersonForm.tsx`

Three bugs in this file:

- [ ] **Step 1: Fix useState type**

```tsx
const [tags, setTags] = useState<string[]>([]);
```

- [ ] **Step 2: Fix TagInput prop name and remove unsupported `label` prop**

`TagInput`'s Props interface has no `label` prop. Add a separate label above and fix the `onTagsChange` → `onChange`.

Replace the TagInput block:
```tsx
        <TagInput
          label="Tags"
          tags={tags}
          onTagsChange={setTags}
        />
```
With:
```tsx
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Tags</label>
          <TagInput
            tags={tags}
            onChange={setTags}
          />
        </div>
```

- [ ] **Step 3: Fix Button props — use `variant=` not boolean props**

```tsx
<Button variant="secondary" onClick={() => setPanelMode('empty')}>
  Cancel
</Button>
<Button variant="primary" type="submit">
  Save
</Button>
```

---

## Task 5: Fix RelationshipForm

**Files:**
- Modify: `src/components/panels/RelationshipForm.tsx`

- [ ] **Step 1: Fix Input onChange handlers**

```tsx
<Input
  label="Label"
  placeholder="friend, coworker, sibling..."
  value={label}
  onChange={(e) => setLabel(e.target.value)}
/>
<Input
  label="Context"
  placeholder="How do you know them?"
  value={context}
  onChange={(e) => setContext(e.target.value)}
/>
```

- [ ] **Step 2: Fix Button props**

```tsx
<Button variant="secondary" onClick={() => setPanelMode('view')}>
  Cancel
</Button>
<Button variant="primary" type="submit" disabled={!targetId || !label} onClick={handleSubmit}>
  Save
</Button>
```

- [ ] **Step 3: Fix PersonPicker onChange — it only needs the id**

Change:
```tsx
onChange={setTargetId}
```
(This will work once PersonPicker's onChange signature is fixed in Task 6.)

---

## Task 6: Fix PersonPicker

**Files:**
- Modify: `src/components/ui/PersonPicker.tsx`

This file has the most bugs: duplicate interface, missing React import, broken input value, onChange mismatch.

- [ ] **Step 1: Rewrite PersonPicker completely**

```tsx
import React, { useState } from 'react';
import useSearch from '../../hooks/useSearch';
import type { Person } from '../../db/types';

interface PersonPickerProps {
  onChange(personId: number): void;
  label?: string;
  exclude?: number[];
}

const PersonPicker: React.FC<PersonPickerProps> = ({ onChange, label, exclude }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchResults = useSearch(query);

  return (
    <div className="relative">
      {label && (
        <label className="text-sm text-gray-400 mb-1 block">{label}</label>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search people..."
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
      {isFocused && query && (
        <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto">
          {searchResults
            .filter((person) => person.id !== undefined && !exclude?.includes(person.id))
            .map((person) => (
              <div
                key={person.id}
                onClick={() => {
                  onChange(person.id!);
                  setQuery(person.name);
                  setIsFocused(false);
                }}
                className="px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 cursor-pointer"
              >
                {person.name}
                {person.nickname && (
                  <span className="text-gray-400 ml-1">({person.nickname})</span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PersonPicker;
```

---

## Task 7: Fix missing React imports

Four files use `React.FC`, `React.FormEvent`, or `React.RefObject` without importing React.

**Files:**
- Modify: `src/components/layout/FAB.tsx`
- Modify: `src/components/panels/EmptyState.tsx`
- Modify: `src/components/panels/PersonForm.tsx`
- Modify: `src/components/panels/RelationshipForm.tsx`

- [ ] **Step 1: Add React import to FAB.tsx**

Change line 1 from nothing to:
```tsx
import React from 'react';
import { useUI } from '../../context/UIContext';
```

- [ ] **Step 2: Add React import to EmptyState.tsx**

Prepend a new first line — do NOT replace the existing imports:
```tsx
import React from 'react';
```
Lines 1–2 of the file (`import { useUI }` and `import Button`) stay unchanged.

- [ ] **Step 3: Fix PersonForm.tsx React import**

Line 1 currently is `import { useState, useEffect } from 'react';`. Change to:
```tsx
import React, { useState, useEffect } from 'react';
```

- [ ] **Step 4: Fix RelationshipForm.tsx React import**

Line 1 currently is `import { useState } from 'react';`. Change to:
```tsx
import React, { useState } from 'react';
```

---

## Task 8: Final build verification

- [ ] **Step 1: Run full build**

```bash
cd C:\Users\smsh3\Desktop\PeopleMap && npm run build
```
Expected: exits with code 0, no TypeScript errors, `dist/` folder created.

- [ ] **Step 2: Run preview server and smoke test**

```bash
npm run preview
```
Open `http://localhost:4173` in browser. Verify:
- Graph canvas renders
- Seed data nodes appear
- Click a node → PersonDetail shows
- Add a person → appears in graph
- Add a relationship → link appears

---

## Task 9: Git init and .gitignore

- [ ] **Step 1: Create .gitignore**

Create `C:\Users\smsh3\Desktop\PeopleMap\.gitignore`:
```
node_modules/
dist/
dist-ssr/
.env
.env.local
.env.*.local
*.local
.vercel
.DS_Store
```

- [ ] **Step 2: Initialize git and commit**

```bash
cd C:\Users\smsh3\Desktop\PeopleMap
git init
git add .
git commit -m "feat: initial PeopleMap PWA"
```

---

## Task 10: Push to GitHub

- [ ] **Step 1: Create GitHub repo**

```bash
gh repo create peoplemap --public --source=. --remote=origin --push
```
(Requires `gh` CLI authenticated. If not installed: `winget install GitHub.cli` then `gh auth login`.)

Expected: repo created at `github.com/<username>/peoplemap` and code pushed.

---

## Task 11: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI**

```bash
pnpm i -g vercel
```

- [ ] **Step 2: Login to Vercel**

```bash
vercel login
```
Follow browser prompt to authenticate.

- [ ] **Step 3: Link and deploy**

```bash
cd C:\Users\smsh3\Desktop\PeopleMap
vercel link
vercel --prod
```

When prompted:
- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

- [ ] **Step 4: Note the deployment URL**

Output will show a URL like `https://peoplemap.vercel.app`. Open it in desktop browser to verify.

- [ ] **Step 5: Remind user to disable AI training in Vercel**

After login: Vercel dashboard → top-right avatar → **Account Settings** → **Privacy** → disable "Allow Vercel to use my data to train AI models."

---

## Task 12: iPhone PWA install

- [ ] **Step 1: Open the Vercel URL in Safari on iPhone**

- [ ] **Step 2: Tap Share → "Add to Home Screen" → Add**

- [ ] **Step 3: Launch from home screen**

Expected: opens full-screen (no browser chrome), graph renders with seed data, app works offline after first load.
