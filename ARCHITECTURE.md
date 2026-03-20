# PeopleMap Architecture

## Tech Stack (Finalized)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18 + Vite + TypeScript | Fast HMR, tree-shaking, strong types |
| Graph | react-force-graph-2d | Canvas-based, built-in force layout, zoom/pan, node interactions out of the box |
| Storage | Dexie.js (IndexedDB) | Reactive `useLiveQuery`, zero-backend, auto-indexing |
| Styling | Tailwind CSS | Utility-first, no CSS files to manage, small bundle |
| State | React Context + Dexie live queries | Context for UI-only state; Dexie handles all data reactivity. No Redux/Zustand needed. |
| PWA | vite-plugin-pwa | Offline support, installable on phone home screen, service worker caching |

**No deviations from proposed stack** (PWA added for mobile support). The combination is well-suited for a local-first SPA with graph visualization. Dexie's `useLiveQuery` eliminates the need for a heavy state manager since the database itself is the source of truth.

**Scale target: 1,000+ people, ~5,000+ relationships.**

---

## Performance at Scale (1,000+ Nodes)

### Graph Rendering Strategy

react-force-graph-2d uses Canvas2D under the hood, which can handle 1,000+ nodes — but only with these tuning knobs:

```
┌─────────────────────────────────────────────────────────────┐
│                Force Simulation Tuning                       │
│                                                             │
│  warmupTicks: 100     → pre-compute 100 ticks before first  │
│                         paint (no janky initial animation)   │
│  cooldownTicks: 200   → stop simulation after 200 ticks     │
│                         (layout settles, CPU goes idle)      │
│  d3AlphaDecay: 0.03   → faster convergence (default 0.0228) │
│  d3VelocityDecay: 0.4 → more damping = less bouncing        │
│                                                             │
│  onEngineStop callback → set flag to skip force recalc on   │
│                          minor data changes                  │
└─────────────────────────────────────────────────────────────┘
```

**Level-of-Detail (LOD) Rendering:**

| Zoom Level | What Renders |
|------------|-------------|
| Far (< 0.5) | Circles only, no labels, links as thin lines |
| Medium (0.5 - 1.5) | Circles + labels for nodes with 3+ connections |
| Close (> 1.5) | All circles + all labels + link labels |

Implemented in `NodeRenderer.ts` — the paint function receives the current `globalScale` and conditionally skips label drawing. This is the single biggest performance win.

**Other graph settings (in `constants.ts`):**

```typescript
export const GRAPH_CONFIG = {
  nodeRelSize: 4,           // base node radius (keep small at scale)
  linkWidth: (link) => Math.max(0.5, link.strength * 0.8),
  nodeCanvasObjectMode: 'replace' as const,  // full custom rendering
  enablePointerInteraction: true,
  minZoom: 0.1,
  maxZoom: 8,
};
```

### Data Layer Optimizations

| Operation | Strategy |
|-----------|----------|
| Load graph data | Single `useLiveQuery` that loads ALL people + relationships. At 1K people + 5K rels this is ~2-3MB — IndexedDB handles this in <100ms. |
| Search | **Debounce 300ms**, limit to 50 results. Use Dexie `.where('name').startsWithIgnoreCase(q).limit(50)` for indexed prefix search. |
| Relationship target picker | Search-based input (type-to-filter), NOT a `<select>` dropdown of 1,000 people. |
| Bulk import | Use `db.transaction('rw', db.people, db.relationships, ...)` with `bulkPut()`, not individual `add()` calls. |
| Relationship count (for node sizing) | Pre-compute a `Map<personId, count>` in `useGraphData` from the relationships array. Do NOT run a separate query per person. |
| Delete person | Cascade-delete: remove person + all relationships where `sourceId` or `targetId` matches. Single transaction. |

### What NOT to Optimize

- **No virtualization on the graph itself.** Canvas2D handles 1K nodes natively. Viewport culling adds complexity for minimal gain at this scale.
- **No web workers for force layout.** The `warmupTicks` + `cooldownTicks` approach is sufficient. Workers add serialization overhead.
- **No pagination for graph data loading.** The graph needs all nodes to compute layout. Partial loads create disconnected islands.

---

## PWA + Mobile Architecture

### PWA Setup

Uses `vite-plugin-pwa` for zero-config service worker + web manifest:

```typescript
// vite.config.ts — add VitePWA plugin
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  manifest: {
    name: 'PeopleMap',
    short_name: 'PeopleMap',
    description: 'Personal network graph',
    theme_color: '#111827',
    background_color: '#111827',
    display: 'standalone',
    orientation: 'any',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

**What this gives you:**
- Installs to phone home screen (Add to Home Screen prompt)
- Works fully offline (service worker caches all assets)
- Full-screen standalone mode (no browser chrome)
- IndexedDB persists across sessions — data is truly local

### Responsive Layout

```
┌──────────────────────────────────────────────────────┐
│                 DESKTOP (>= 768px)                    │
│                                                      │
│  ┌─────────────┐  ┌──────────────────────────────┐  │
│  │   Sidebar    │  │                              │  │
│  │   (320px)    │  │        Graph Canvas          │  │
│  │             │  │        (fills rest)           │  │
│  │  - Search   │  │                              │  │
│  │  - Detail   │  │                              │  │
│  │  - Forms    │  │                              │  │
│  └─────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────┐
│    MOBILE (< 768px)       │
│                          │
│  ┌──────────────────────┐│
│  │                      ││
│  │    Graph Canvas      ││
│  │    (full screen)     ││
│  │                      ││
│  │   [+] FAB button     ││
│  └──────────────────────┘│
│  ┌──────────────────────┐│
│  │  Bottom Sheet        ││  ← slides up on node tap
│  │  (swipe to dismiss)  ││
│  │  - Search / Detail   ││
│  │  - Forms             ││
│  └──────────────────────┘│
└──────────────────────────┘
```

**Mobile-specific components:**

| Component | Desktop | Mobile |
|-----------|---------|--------|
| `Sidebar` | Fixed left panel, always visible | Hidden — content renders inside `BottomSheet` |
| `BottomSheet` | Not rendered | Slides up from bottom, 3 snap points (peek/half/full) |
| `FAB` | Not rendered | Floating "+" button, bottom-right corner |
| `GraphCanvas` | Fills space right of sidebar | Fills entire viewport |

### Touch Interactions

| Gesture | Action |
|---------|--------|
| Tap node | Select → open bottom sheet with person detail |
| Tap canvas | Deselect → dismiss bottom sheet |
| Pinch | Zoom (built into react-force-graph-2d) |
| Pan/drag | Move canvas (built in) |
| Long-press node | Quick-action menu (edit / delete / connect) |
| Swipe down on sheet | Dismiss |

---

## Folder Structure

```
src/
  db/
    database.ts              # Dexie subclass, table declarations, version/upgrade
    types.ts                 # All TypeScript interfaces and enums
    personService.ts         # CRUD operations for Person table
    relationshipService.ts   # CRUD operations for Relationship table
    exportService.ts         # JSON export/import for full database backup

  hooks/
    useGraphData.ts          # Transforms DB records into react-force-graph nodes/links
    usePersonActions.ts      # Wraps personService with loading/error state
    useRelationshipActions.ts # Wraps relationshipService with loading/error state
    useSearch.ts             # Fuzzy search/filter across people and tags
    useMediaQuery.ts         # Returns boolean for breakpoint (mobile < 768px)

  context/
    UIContext.tsx            # UI-only state: selectedNodeId, panelMode, searchQuery, modalState

  components/
    layout/
      AppShell.tsx           # Top-level layout: switches between desktop/mobile
      Sidebar.tsx            # Desktop: left sidebar container
      BottomSheet.tsx         # Mobile: slide-up panel with snap points
      FAB.tsx                 # Mobile: floating action button

    graph/
      GraphCanvas.tsx        # react-force-graph-2d wrapper, renders nodes/links
      NodeRenderer.ts        # Custom node paint function (Canvas2D draw calls)
      LinkRenderer.ts        # Custom link paint function (labels, thickness)
      GraphControls.tsx      # Zoom reset, center graph, layout toggle buttons

    panels/
      PersonDetail.tsx       # View mode: shows selected person's info, tags, relationships
      PersonForm.tsx         # Add/edit person form (name, nickname, notes, tags)
      RelationshipForm.tsx   # Add/edit relationship between two people
      SearchPanel.tsx        # Search input + filtered results list
      EmptyState.tsx         # Shown when no person is selected

    ui/
      Button.tsx             # Styled button variants (primary, secondary, danger)
      Input.tsx              # Text input with label
      TextArea.tsx           # Multiline input with label
      Modal.tsx              # Generic modal overlay
      TagBadge.tsx           # Colored tag pill
      TagInput.tsx           # Multi-tag input with autocomplete
      PersonPicker.tsx       # Search-to-select person input (for relationship target)

  utils/
    colors.ts                # Deterministic color generation from string (for nodes/tags)
    constants.ts             # App-wide constants (graph physics, limits, defaults)

  App.tsx                    # Root component: providers + AppShell
  main.tsx                   # Vite entry point: renders App into #root
  index.css                  # Tailwind directives (@tailwind base/components/utilities)

public/
  favicon.svg
  icon-192.png               # PWA icon
  icon-512.png               # PWA icon
```

**File count: ~35 files. Each file has a single responsibility and fits within a small context window.**

---

## Database Schema

### Table: `people`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `number` (auto-increment) | Primary key |
| `name` | `string` | Full name (required, indexed) |
| `nickname` | `string?` | Optional short name |
| `notes` | `string?` | Freeform notes about this person |
| `tags` | `string[]` | Contexts/groups: "work", "college", "family" (multi-entry indexed) |
| `avatarColor` | `string?` | Hex color override; auto-generated if omitted |
| `createdAt` | `number` | Unix timestamp ms |
| `updatedAt` | `number` | Unix timestamp ms |

**Indexes:** `name`, `*tags` (multi-entry), `createdAt`

### Table: `relationships`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `number` (auto-increment) | Primary key |
| `sourceId` | `number` | FK to people.id (indexed) |
| `targetId` | `number` | FK to people.id (indexed) |
| `label` | `string` | Relationship type: "coworker", "friend", "sibling" |
| `context` | `string?` | Where/how they're connected: "Met at Google 2023" |
| `strength` | `number` | 1-5 scale, affects link thickness |
| `createdAt` | `number` | Unix timestamp ms |
| `updatedAt` | `number` | Unix timestamp ms |

**Indexes:** `sourceId`, `targetId`, `[sourceId+targetId]` (compound, unique-ish)

---

## TypeScript Interfaces

```typescript
// db/types.ts

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

export interface Relationship {
  id?: number;
  sourceId: number;
  targetId: number;
  label: string;
  context?: string;
  strength: number; // 1-5
  createdAt: number;
  updatedAt: number;
}

// Graph rendering types (consumed by react-force-graph-2d)
export interface GraphNode {
  id: number;
  name: string;
  nickname?: string;
  tags: string[];
  color: string;
  val: number; // node size = relationship count
}

export interface GraphLink {
  source: number;
  target: number;
  label: string;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// UI state
export type PanelMode = 'empty' | 'view' | 'addPerson' | 'editPerson' | 'addRelationship';

export interface UIState {
  selectedNodeId: number | null;
  panelMode: PanelMode;
  searchQuery: string;
  modalOpen: boolean;
  bottomSheetOpen: boolean; // mobile only
}
```

---

## State Management Strategy

```
┌──────────────────────────────────────────────────┐
│                  Data Layer                       │
│                                                  │
│   IndexedDB (via Dexie)                          │
│   └── useLiveQuery() → auto-rerenders on change  │
│                                                  │
│   personService.ts   → add/update/delete/get     │
│   relationshipService.ts → add/update/delete/get │
└──────────────────────────────────────────────────┘
          │ reactive queries                ▲ mutations
          ▼                                 │
┌──────────────────────────────────────────────────┐
│                 Hook Layer                        │
│                                                  │
│   useGraphData()   → transforms DB → GraphData   │
│   useSearch()      → filters people by query     │
│   usePersonActions() → wraps service + UI state  │
│   useMediaQuery()  → mobile vs desktop boolean   │
└──────────────────────────────────────────────────┘
          │ props / context                 ▲ callbacks
          ▼                                 │
┌──────────────────────────────────────────────────┐
│               Component Layer                     │
│                                                  │
│   UIContext provides: selectedNodeId, panelMode,  │
│   searchQuery, modalOpen, bottomSheetOpen         │
│                                                  │
│   Components read UIContext for display logic     │
│   Components call hook actions for data changes   │
└──────────────────────────────────────────────────┘
```

**Key principle:** Data flows through Dexie, not React state. Components never cache DB data in `useState`. The database is the single source of truth. UI-only state (what's selected, what panel is open) lives in React Context.

---

## Component Hierarchy

```
App
├── UIContext.Provider
│   └── AppShell
│       │
│       ├── [Desktop: isMobile === false]
│       │   ├── Sidebar
│       │   │   ├── SearchPanel
│       │   │   ├── PersonDetail        (panelMode: 'view')
│       │   │   ├── PersonForm          (panelMode: 'addPerson' | 'editPerson')
│       │   │   ├── RelationshipForm    (panelMode: 'addRelationship')
│       │   │   │   └── PersonPicker (target selection)
│       │   │   └── EmptyState          (panelMode: 'empty')
│       │   └── GraphCanvas + GraphControls
│       │
│       └── [Mobile: isMobile === true]
│           ├── GraphCanvas (full viewport)
│           ├── FAB ("+" button, bottom-right)
│           └── BottomSheet (slides up on node tap)
│               └── [same panel content as Sidebar]
│
└── Modal (portal, conditionally rendered)
```

---

## Data Flow: Key User Actions

### Add a person
1. User clicks "Add Person" (desktop sidebar) or FAB button (mobile) → `setPanelMode('addPerson')`
2. `PersonForm` renders in sidebar (desktop) or bottom sheet (mobile)
3. On submit → `personService.add(person)` writes to IndexedDB
4. `useLiveQuery` in `useGraphData` auto-fires → graph re-renders with new node

### Click/tap a node
1. `GraphCanvas` `onNodeClick` → `setSelectedNodeId(node.id)`
2. Desktop: `Sidebar` switches to `PersonDetail`
3. Mobile: `BottomSheet` slides up with `PersonDetail`

### Add a relationship
1. From `PersonDetail`, click "Add Connection" → `setPanelMode('addRelationship')`
2. `RelationshipForm` pre-fills `sourceId` from selected person
3. Target person selected via **search-based input** (type name → filtered list → click to select)
4. On submit → `relationshipService.add(rel)` writes to IndexedDB
5. Graph auto-updates with new link

### Search
1. User types in `SearchPanel` → `setSearchQuery(query)`
2. `useSearch` hook filters people by name/nickname/tags
3. Clicking a search result → `setSelectedNodeId(id)` + camera centers on node

### Export/Import
1. `exportService.exportAll()` → serializes both tables to JSON blob → triggers download
2. `exportService.importAll(json)` → validates + bulk-inserts into Dexie (clears first)
