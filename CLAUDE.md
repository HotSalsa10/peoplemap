# PeopleMap - Project Rules

## Tech Stack

- **React 19** via Vite 8 with TypeScript (strict mode)
- **react-force-graph-2d** for graph visualization
- **Dexie.js** v4+ for IndexedDB storage (use `useLiveQuery` for reactive reads)
- **Tailwind CSS** v4 via `@tailwindcss/vite` plugin
- **vite-plugin-pwa** for offline support + installable PWA
- No backend. No API calls. No server. Everything runs in the browser and on the phone.

## Architecture Reference

See `ARCHITECTURE.md` for the complete folder structure, database schema, TypeScript interfaces, and component hierarchy.

## Critical Constraints

### Local-First Data Rules
- ALL data lives in IndexedDB via Dexie. Never use localStorage for structured data.
- Dexie is the single source of truth. Never cache DB records in React `useState`.
- Use `useLiveQuery()` for all data reads — it auto-rerenders when the DB changes.
- Service files (`personService.ts`, `relationshipService.ts`) handle all mutations.
- Always set `updatedAt: Date.now()` on every write operation.
- Export/import must handle the full database as a single JSON file.

### State Management Rules
- **React Context (`UIContext`)** is for UI-only state: `selectedNodeId`, `panelMode`, `searchQuery`, `modalOpen`.
- **Never put DB data in context.** Let `useLiveQuery` handle data reactivity.
- Components call service functions directly (via hooks) for data mutations.

### Graph Behavior
- Nodes represent people. Node size (`val`) scales with relationship count.
- Links represent relationships. Link thickness scales with `strength` (1-5).
- Node color is deterministic from the person's name (use `utils/colors.ts`).
- Clicking a node selects it and opens the sidebar detail panel.
- Clicking canvas background deselects the current node.
- Provide zoom-to-fit and center-on-node controls.
- Use Canvas2D custom rendering for nodes (circle + label), not default DOM rendering.

### Performance Rules (1,000+ People)
- **Graph tuning:** Set `warmupTicks: 100`, `cooldownTicks: 200`, `d3AlphaDecay: 0.03`, `d3VelocityDecay: 0.4` on the graph component.
- **LOD rendering:** In `NodeRenderer.ts`, only draw labels when `globalScale > 0.5`. At far zoom, render circles only.
- **Search debounce:** Always debounce search input by 300ms. Limit results to 50.
- **No dropdowns for person selection.** With 1,000+ people, `<select>` is unusable. Always use search-to-filter inputs.
- **Bulk operations:** Use `bulkPut()` inside a Dexie transaction for imports. Never loop with individual `add()`.
- **Pre-compute relationship counts:** Build a `Map<personId, number>` once in `useGraphData`, not per-node queries.
- **Cascade deletes:** Deleting a person must also remove all their relationships in one transaction.

### Mobile + PWA Rules
- **Responsive breakpoint:** 768px. Use `useMediaQuery('(max-width: 767px)')` to detect mobile.
- **Desktop:** Sidebar (320px fixed left) + GraphCanvas (fills rest).
- **Mobile:** GraphCanvas (full viewport) + BottomSheet (slides up) + FAB button (bottom-right).
- **Panel content is shared.** `PersonDetail`, `PersonForm`, `RelationshipForm`, `SearchPanel` render identically — only their container differs (Sidebar vs BottomSheet).
- **Touch:** Tap node = select. Tap canvas = deselect + dismiss sheet. Long-press = quick actions. Pinch/pan handled by react-force-graph-2d.
- **PWA manifest** is configured in `vite.config.ts` via `vite-plugin-pwa`. Icons go in `public/`.
- **No conditional imports.** Both desktop and mobile components are always bundled. `AppShell` conditionally renders based on `useMediaQuery`.

### Component Rules
- One component per file. No file should exceed 120 lines.
- Props interfaces are defined in the same file as the component, above the component.
- Every component that reads data uses `useLiveQuery` directly or receives data via props from a parent that does.
- UI primitive components (`ui/` folder) must be stateless and take all data via props.
- Panel components switch based on `panelMode` from `UIContext`.

### Styling Rules
- Use Tailwind utility classes exclusively. No custom CSS except `index.css` directives.
- No inline `style={}` objects except for dynamic values (graph canvas dimensions).
- Consistent spacing: `p-4` for panels, `gap-2` for form fields, `mb-6` for sections.
- Dark-friendly palette: use `bg-gray-900`, `bg-gray-800`, `text-gray-100` as base.

## Coding Standards

### TypeScript
- All types/interfaces live in `db/types.ts`. Import from there.
- Use `interface` for object shapes, `type` for unions/aliases.
- No `any`. Use `unknown` and narrow if needed.
- Mark optional fields with `?`, not `| undefined`.

### File Naming
- Components: `PascalCase.tsx` (e.g., `PersonForm.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useGraphData.ts`)
- Services: `camelCase.ts` with `Service` suffix (e.g., `personService.ts`)
- Utils: `camelCase.ts` (e.g., `colors.ts`)

### Imports
- Use path aliases if configured, otherwise relative imports.
- Group: React imports → third-party → local modules → types.

## Implementation Order (for Qwen)

Follow this exact sequence. Each step is one file or a small group of related files. Complete and test each step before moving on.

### Phase 1: Foundation
1. `npm create vite@latest . -- --template react-ts` + install deps (including `vite-plugin-pwa`)
2. `src/db/types.ts` — all interfaces and enums (includes `bottomSheetOpen` in UIState)
3. `src/db/database.ts` — Dexie subclass with table declarations
4. `src/utils/constants.ts` — app-wide constants (includes `MOBILE_BREAKPOINT: 768`)
5. `src/utils/colors.ts` — deterministic color from string
6. `src/index.css` — Tailwind import (`@import "tailwindcss"`)
7. `vite.config.ts` — add VitePWA plugin with manifest config

### Phase 2: Data Layer
8. `src/db/personService.ts` — CRUD for people
9. `src/db/relationshipService.ts` — CRUD for relationships
10. `src/hooks/usePersonActions.ts` — wraps person service
11. `src/hooks/useRelationshipActions.ts` — wraps relationship service
12. `src/hooks/useGraphData.ts` — transforms DB into GraphData
13. `src/hooks/useSearch.ts` — search/filter logic
14. `src/hooks/useMediaQuery.ts` — responsive breakpoint hook

### Phase 3: UI Primitives
15. `src/components/ui/Button.tsx`
16. `src/components/ui/Input.tsx`
17. `src/components/ui/TextArea.tsx`
18. `src/components/ui/TagBadge.tsx`
19. `src/components/ui/TagInput.tsx`
20. `src/components/ui/Modal.tsx`
21. `src/components/ui/PersonPicker.tsx` — search-to-select person input

### Phase 4: Context + Layout
22. `src/context/UIContext.tsx`
23. `src/components/layout/Sidebar.tsx` — desktop sidebar
24. `src/components/layout/BottomSheet.tsx` — mobile slide-up panel
25. `src/components/layout/FAB.tsx` — mobile floating action button
26. `src/components/layout/AppShell.tsx` — uses `useMediaQuery` to switch layouts

### Phase 5: Graph
27. `src/components/graph/NodeRenderer.ts` — LOD rendering (labels only when zoomed in)
28. `src/components/graph/LinkRenderer.ts`
29. `src/components/graph/GraphCanvas.tsx` — includes touch event handling
30. `src/components/graph/GraphControls.tsx`

### Phase 6: Panels
31. `src/components/panels/EmptyState.tsx`
32. `src/components/panels/PersonDetail.tsx`
33. `src/components/panels/PersonForm.tsx`
34. `src/components/panels/RelationshipForm.tsx` — uses PersonPicker for target
35. `src/components/panels/SearchPanel.tsx` — debounced, 50-result limit

### Phase 7: Integration
36. `src/App.tsx` — wire providers + AppShell
37. `src/main.tsx` — mount App
38. `src/db/exportService.ts` — JSON export/import with bulkPut

### Phase 8: PWA + Polish
39. Generate PWA icons (192x192 and 512x512) in `public/`
40. Add seed data utility for demo/testing
41. Keyboard shortcuts (Escape to deselect, Ctrl+K for search)
42. Test PWA install on phone (serve with `npm run preview`, access via local IP)

## Qwen 2.5 Coder 14B — Workflow Guide

Qwen runs locally via Ollama on 16GB RAM. Its effective context window is limited (~4K-6K tokens for code generation). Every prompt must be self-contained — Qwen cannot see your project, other files, or prior conversation. The workflow below is designed around this constraint.

### Setup

```
ollama pull qwen2.5-coder:14b
```

Use Ollama's API or a frontend like Open WebUI / Continue (VS Code extension). Continue is recommended because it supports inline file editing with `@file` context.

### The Prompt Template

Use this structure for every file you ask Qwen to generate:

```
Create the file: src/db/personService.ts

It exports CRUD functions for the Person table using Dexie.js.

Here are the types it uses (from types.ts):

    export interface Person {
      id?: number;
      name: string;
      nickname?: string;
      notes?: string;
      tags: string[];
      avatarColor?: string;
      createdAt: number;
      updatedAt: number;
    }

Here is the database instance it imports (from database.ts):

    import { db } from './database';
    // db.people is a Dexie.Table<Person, number>

Requirements:
- Export functions: addPerson, updatePerson, deletePerson, getPersonById, getAllPeople
- deletePerson must also delete all relationships where sourceId or targetId matches
- Always set updatedAt: Date.now() on add and update
- Use bulkDelete for cascade relationship removal
- Keep the file under 80 lines
```

**Key elements:**
1. **File path** — so Qwen knows where it goes
2. **What it does** — one sentence
3. **Pasted types/imports** — everything it needs, inline
4. **Explicit requirements** — bullet list of expected exports/behavior
5. **Line limit** — prevents bloat

### Workflow: Step by Step

```
Phase N from CLAUDE.md
    │
    ▼
┌─────────────────────────────────┐
│ 1. Read the file's description  │
│    from ARCHITECTURE.md         │
│                                 │
│ 2. Identify what types/imports  │
│    this file needs              │
│                                 │
│ 3. Copy-paste those types into  │
│    your prompt (from types.ts   │
│    or from already-written      │
│    files' export signatures)    │
│                                 │
│ 4. Write the prompt using the   │
│    template above               │
│                                 │
│ 5. Send to Qwen                 │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ 6. Review Qwen's output:       │
│    - Does it match types.ts?    │
│    - Are imports correct?       │
│    - Is it under line limit?    │
│                                 │
│ 7. Paste into the file          │
│                                 │
│ 8. Fix any TypeScript errors    │
│    in your editor               │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ 9. After each phase:           │
│    npm run dev                  │
│    Open browser, test manually  │
│                                 │
│ 10. If errors, re-prompt Qwen  │
│     with error message + types  │
└─────────────────────────────────┘
```

### Error Recovery Prompts

When Qwen generates code that doesn't compile, use this pattern:

```
The file src/components/graph/GraphCanvas.tsx has this TypeScript error:

    Type 'GraphNode' is not assignable to type 'NodeObject'.
    Property 'x' is missing.

Here is the current code:
    [paste the broken section, 20-30 lines max]

Here are the types:
    [paste GraphNode interface]

Fix only the broken part. Keep everything else the same.
```

**Rules for error recovery:**
- Paste the **error message exactly** as your editor shows it
- Include **only the broken section**, not the whole file
- Re-paste the **relevant types** (Qwen has no memory of prior prompts)
- Ask it to fix **only** the issue, not rewrite the whole file

### What to Paste per Phase

| Phase | Types/Context Qwen Needs |
|-------|-------------------------|
| 1: Foundation | Nothing — these are standalone files |
| 2: Data Layer | `Person`, `Relationship` interfaces + `db` import signature |
| 3: UI Primitives | Nothing (except `PersonPicker` needs `Person` interface + `useSearch` signature) |
| 4: Context + Layout | `UIState`, `PanelMode` types + `useMediaQuery` signature |
| 5: Graph | `GraphNode`, `GraphLink`, `GraphData` + `GRAPH_CONFIG` constants + react-force-graph-2d prop types |
| 6: Panels | `Person`, `Relationship` + service function signatures + `UIState` |
| 7: Integration | Component import paths + provider nesting order |
| 8: PWA + Polish | PWA config is in vite.config.ts, seed data needs `Person`/`Relationship` types |

### Tips for Best Results with Qwen 14B

1. **One file per prompt.** Never ask for multiple files at once.
2. **Paste types, don't reference them.** "Use the Person interface from types.ts" fails. Paste the actual interface.
3. **Specify imports explicitly.** Tell Qwen: `import { db } from './database'` — don't expect it to figure out paths.
4. **Set line limits.** Say "under 80 lines" or "under 60 lines". Without this, Qwen tends to be verbose.
5. **Avoid abstract instructions.** Bad: "Make it performant." Good: "Only draw the label text when `globalScale > 0.5`."
6. **Use numbered requirements.** Qwen follows bullet/numbered lists more reliably than prose paragraphs.
7. **Don't ask Qwen to decide architecture.** All decisions are already in ARCHITECTURE.md. Qwen is a typist, not an architect.
8. **If Qwen hallucinates an API,** re-prompt with the correct API signature from the library's docs. Example: "The react-force-graph-2d `nodeCanvasObject` callback signature is: `(node, ctx, globalScale) => void`"
9. **For complex components (GraphCanvas, SearchPanel),** break the prompt into two passes: first the skeleton with props/state, then fill in the logic.
10. **Save working versions.** Before asking Qwen to modify an existing file, copy the working version. If the edit breaks things, you can revert and try a more targeted prompt.
