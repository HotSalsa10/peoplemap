# PeopleMap — All Qwen Prompts

Use one prompt per session. Copy the whole block, paste into Qwen, copy the output into the file.
Already done: index.css, vite.config.ts, src/db/types.ts, src/db/database.ts, src/utils/constants.ts

---

## STEP 5 — src/utils/colors.ts

```
Create the file: src/utils/colors.ts

It exports a function that generates a deterministic hex color from a string (used for graph nodes and tags).

Requirements:
- Export function: getColorFromString(str: string): string
- Uses a simple hash of the string to pick from a fixed palette of 12 distinct colors
- The palette must be visually distinct and look good on a dark background (#111827)
- Same input always returns same color
- No external dependencies

Keep under 30 lines.
```

---

## STEP 8 — src/db/personService.ts

```
Create the file: src/db/personService.ts

It exports CRUD functions for the Person table using Dexie.

Imports to use:
    import { db } from './database';
    import type { Person } from './types';

Here are the types:

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

Requirements:
- Export these functions:
    addPerson(data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>
    updatePerson(id: number, data: Partial<Omit<Person, 'id' | 'createdAt'>>): Promise<void>
    deletePerson(id: number): Promise<void>
    getPersonById(id: number): Promise<Person | undefined>
    getAllPeople(): Promise<Person[]>
- addPerson sets createdAt and updatedAt to Date.now()
- updatePerson sets updatedAt to Date.now()
- deletePerson must also delete all relationships where sourceId === id OR targetId === id, all in one Dexie transaction
- Keep under 50 lines
```

---

## STEP 9 — src/db/relationshipService.ts

```
Create the file: src/db/relationshipService.ts

It exports CRUD functions for the Relationship table using Dexie.

Imports to use:
    import { db } from './database';
    import type { Relationship } from './types';

Here are the types:

    export interface Relationship {
      id?: number;
      sourceId: number;
      targetId: number;
      label: string;
      context?: string;
      strength: number;
      createdAt: number;
      updatedAt: number;
    }

Requirements:
- Export these functions:
    addRelationship(data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>
    updateRelationship(id: number, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>): Promise<void>
    deleteRelationship(id: number): Promise<void>
    getRelationshipsForPerson(personId: number): Promise<Relationship[]>
- addRelationship sets createdAt and updatedAt to Date.now()
- updateRelationship sets updatedAt to Date.now()
- getRelationshipsForPerson returns all relationships where sourceId === personId OR targetId === personId
- Keep under 40 lines
```

---

## STEP 10 — src/hooks/usePersonActions.ts

```
Create the file: src/hooks/usePersonActions.ts

It is a React hook that wraps personService with loading and error state.

Imports to use:
    import { useState } from 'react';
    import { addPerson, updatePerson, deletePerson } from '../db/personService';
    import type { Person } from '../db/types';

Requirements:
- Export default function usePersonActions()
- Returns an object with:
    loading: boolean
    error: string | null
    add(data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null>
    update(id: number, data: Partial<Omit<Person, 'id' | 'createdAt'>>): Promise<void>
    remove(id: number): Promise<void>
- Each function sets loading true before the call, false after
- On error: sets error to the error message string, returns null for add
- Keep under 50 lines
```

---

## STEP 11 — src/hooks/useRelationshipActions.ts

```
Create the file: src/hooks/useRelationshipActions.ts

It is a React hook that wraps relationshipService with loading and error state.

Imports to use:
    import { useState } from 'react';
    import { addRelationship, updateRelationship, deleteRelationship } from '../db/relationshipService';
    import type { Relationship } from '../db/types';

Requirements:
- Export default function useRelationshipActions()
- Returns an object with:
    loading: boolean
    error: string | null
    add(data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null>
    update(id: number, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>): Promise<void>
    remove(id: number): Promise<void>
- Each function sets loading true before the call, false after
- On error: sets error to the error message string, returns null for add
- Keep under 50 lines
```

---

## STEP 12 — src/hooks/useGraphData.ts

```
Create the file: src/hooks/useGraphData.ts

It is a React hook that loads all people and relationships from Dexie and transforms them into graph data for react-force-graph-2d.

Imports to use:
    import { useLiveQuery } from 'dexie-react-hooks';
    import { db } from '../db/database';
    import { getColorFromString } from '../utils/colors';
    import type { GraphData, GraphNode, GraphLink } from '../db/types';

Here are the relevant types:

    export interface GraphNode {
      id: number;
      name: string;
      nickname?: string;
      tags: string[];
      color: string;
      val: number;
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

Requirements:
- Export default function useGraphData(): GraphData
- Uses useLiveQuery to load ALL people and ALL relationships in one query
- Builds a Map<personId, number> to count relationships per person (count both sourceId and targetId)
- Transforms people into GraphNode[], where:
    color = getColorFromString(person.name)
    val = Math.max(1, relationshipCount)
- Transforms relationships into GraphLink[]
- Returns { nodes: [], links: [] } if data is not yet loaded
- Keep under 50 lines
```

---

## STEP 13 — src/hooks/useSearch.ts

```
Create the file: src/hooks/useSearch.ts

It is a React hook that searches people in Dexie by name, nickname, or tags.

Imports to use:
    import { useState, useEffect } from 'react';
    import { db } from '../db/database';
    import type { Person } from '../db/types';

Requirements:
- Export default function useSearch(query: string): Person[]
- Debounces the query by 300ms before running the search
- If query is empty, returns []
- If query is not empty, searches Dexie:
    - Gets all people where name starts with query (case-insensitive)
    - Also gets all people where any tag includes the query string
    - Merges results, deduplicates by id, limits to 50
- Returns the result array (updates reactively as query changes)
- Keep under 50 lines
```

---

## STEP 14 — src/hooks/useMediaQuery.ts

```
Create the file: src/hooks/useMediaQuery.ts

It is a React hook that returns true if the screen matches a CSS media query.

Requirements:
- Export default function useMediaQuery(query: string): boolean
- Uses window.matchMedia to check the query
- Listens for changes with addEventListener('change', ...)
- Cleans up the listener on unmount
- Returns false during SSR (if window is undefined)
- Keep under 25 lines

Example usage: useMediaQuery('(max-width: 767px)') returns true on mobile
```

---

## STEP 15 — src/components/ui/Button.tsx

```
Create the file: src/components/ui/Button.tsx

It is a styled button component using Tailwind CSS.

Requirements:
- Props interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>:
    variant?: 'primary' | 'secondary' | 'danger'  (default: 'primary')
    size?: 'sm' | 'md'  (default: 'md')
- Renders a <button> with Tailwind classes based on variant and size
- primary: bg-indigo-600 hover:bg-indigo-700 text-white
- secondary: bg-gray-700 hover:bg-gray-600 text-gray-100
- danger: bg-red-700 hover:bg-red-600 text-white
- sm: text-sm px-3 py-1.5 rounded
- md: text-sm px-4 py-2 rounded-md
- Always includes: font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
- Passes all other button props through (onClick, disabled, type, etc.)
- Keep under 30 lines
```

---

## STEP 16 — src/components/ui/Input.tsx

```
Create the file: src/components/ui/Input.tsx

It is a styled text input component with an optional label, using Tailwind CSS.

Requirements:
- Props interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>:
    label?: string
    error?: string
- Renders a <div> wrapper containing:
    - Optional <label> (if label prop provided) with text-sm text-gray-400 mb-1
    - <input> with Tailwind classes: w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500
    - Optional error <p> (if error prop provided) with text-xs text-red-400 mt-1
- Passes all other input props through
- Keep under 30 lines
```

---

## STEP 17 — src/components/ui/TextArea.tsx

```
Create the file: src/components/ui/TextArea.tsx

It is a styled textarea component with an optional label, using Tailwind CSS.

Requirements:
- Props interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>:
    label?: string
    error?: string
- Renders a <div> wrapper containing:
    - Optional <label> (if label prop provided) with text-sm text-gray-400 mb-1
    - <textarea> with: w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none
    - Optional error <p> (if error prop provided) with text-xs text-red-400 mt-1
- Default rows={3} unless overridden
- Passes all other textarea props through
- Keep under 30 lines
```

---

## STEP 18 — src/components/ui/TagBadge.tsx

```
Create the file: src/components/ui/TagBadge.tsx

It is a small colored tag pill component using Tailwind CSS.

Requirements:
- Props interface:
    tag: string
    onRemove?: () => void  (if provided, shows an × button)
- Renders a <span> with: inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-200
- If onRemove is provided, renders a <button> inside with × character, text-indigo-300 hover:text-white
- Keep under 25 lines
```

---

## STEP 19 — src/components/ui/TagInput.tsx

```
Create the file: src/components/ui/TagInput.tsx

It is a multi-tag input component using Tailwind CSS. Users type a tag and press Enter or comma to add it.

Imports to use:
    import { useState, KeyboardEvent } from 'react';
    import TagBadge from './TagBadge';

Requirements:
- Props interface:
    tags: string[]
    onChange(tags: string[]): void
    placeholder?: string
- Renders a <div> with:
    - A row of TagBadge components (each with onRemove that filters out that tag)
    - An <input> where user types new tags
- On Enter or comma key: trims the input value, adds it to tags if non-empty and not duplicate, clears input
- Uses Tailwind: flex flex-wrap gap-1 p-2 bg-gray-800 border border-gray-700 rounded-md
- Input inside: bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500 min-w-24
- Keep under 50 lines
```

---

## STEP 20 — src/components/ui/Modal.tsx

```
Create the file: src/components/ui/Modal.tsx

It is a modal overlay component that renders via React portal.

Imports to use:
    import { ReactNode } from 'react';
    import { createPortal } from 'react-dom';

Requirements:
- Props interface:
    open: boolean
    onClose(): void
    children: ReactNode
    title?: string
- If open is false, returns null
- Renders via createPortal into document.body
- Backdrop: fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4
- Clicking backdrop calls onClose
- Modal panel: bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6
- Clicking panel does NOT close (stopPropagation)
- If title provided, renders <h2> text-lg font-semibold text-gray-100 mb-4
- Keep under 40 lines
```

---

## STEP 21 — src/components/ui/PersonPicker.tsx

```
Create the file: src/components/ui/PersonPicker.tsx

It is a search-to-select person input component. User types a name, sees a filtered list, clicks to select.

Imports to use:
    import { useState } from 'react';
    import useSearch from '../../hooks/useSearch';
    import type { Person } from '../../db/types';

Here are the relevant types:

    export interface Person {
      id?: number;
      name: string;
      nickname?: string;
      tags: string[];
    }

Requirements:
- Props interface:
    value: number | null  (selected person id)
    onChange(personId: number, person: Person): void
    label?: string
    exclude?: number[]  (person ids to hide from results)
- Renders a <div> with:
    - Optional label
    - Text input showing the selected person's name (or empty if none selected)
    - When input is focused and has text, shows a dropdown list of search results
    - Each result item: clickable, shows person.name and person.nickname if present
    - Clicking a result calls onChange and clears the dropdown
- Uses useSearch(inputValue) for results
- Filters out ids in the exclude array
- Dropdown: absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto
- Result item: px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 cursor-pointer
- Keep under 60 lines
```

---

## STEP 22 — src/context/UIContext.tsx

```
Create the file: src/context/UIContext.tsx

It defines the React context for all UI-only state in PeopleMap.

Imports to use:
    import { createContext, useContext, useState, ReactNode } from 'react';
    import type { PanelMode, UIState } from '../db/types';

Here are the relevant types:

    export type PanelMode = 'empty' | 'view' | 'addPerson' | 'editPerson' | 'addRelationship';

    export interface UIState {
      selectedNodeId: number | null;
      panelMode: PanelMode;
      searchQuery: string;
      modalOpen: boolean;
      bottomSheetOpen: boolean;
    }

Requirements:
- Create UIContextValue interface that extends UIState with setters:
    setSelectedNodeId(id: number | null): void
    setPanelMode(mode: PanelMode): void
    setSearchQuery(q: string): void
    setModalOpen(open: boolean): void
    setBottomSheetOpen(open: boolean): void
- Create UIContext with createContext (default value undefined)
- Export UIProvider component that wraps children in UIContext.Provider with useState for each field
- Initial state: selectedNodeId null, panelMode 'empty', searchQuery '', modalOpen false, bottomSheetOpen false
- Export useUI hook that calls useContext and throws if used outside provider
- Keep under 50 lines
```

---

## STEP 23 — src/components/layout/Sidebar.tsx

```
Create the file: src/components/layout/Sidebar.tsx

It is the desktop left sidebar that renders the correct panel based on panelMode.

Imports to use:
    import { useUI } from '../../context/UIContext';
    import SearchPanel from '../panels/SearchPanel';
    import PersonDetail from '../panels/PersonDetail';
    import PersonForm from '../panels/PersonForm';
    import RelationshipForm from '../panels/RelationshipForm';
    import EmptyState from '../panels/EmptyState';

Requirements:
- No props
- Reads panelMode from useUI()
- Renders a <div> with: w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden
- At the top always renders <SearchPanel />
- Below that renders the panel matching panelMode:
    'view' → <PersonDetail />
    'addPerson' | 'editPerson' → <PersonForm />
    'addRelationship' → <RelationshipForm />
    'empty' → <EmptyState />
- Keep under 35 lines
```

---

## STEP 24 — src/components/layout/BottomSheet.tsx

```
Create the file: src/components/layout/BottomSheet.tsx

It is the mobile bottom sheet panel that slides up over the graph.

Imports to use:
    import { useUI } from '../../context/UIContext';
    import SearchPanel from '../panels/SearchPanel';
    import PersonDetail from '../panels/PersonDetail';
    import PersonForm from '../panels/PersonForm';
    import RelationshipForm from '../panels/RelationshipForm';
    import EmptyState from '../panels/EmptyState';

Requirements:
- No props
- Reads bottomSheetOpen, panelMode, setBottomSheetOpen from useUI()
- Renders a fixed bottom panel: fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 rounded-t-2xl transition-transform duration-300
- When bottomSheetOpen is true: translate-y-0 (visible), when false: translate-y-full (hidden)
- At the top: a drag handle bar (w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-2) and a close button (×) that calls setBottomSheetOpen(false)
- max-h-[80vh] overflow-y-auto
- Below handle renders panel content same as Sidebar (based on panelMode)
- Keep under 50 lines
```

---

## STEP 25 — src/components/layout/FAB.tsx

```
Create the file: src/components/layout/FAB.tsx

It is a mobile floating action button for adding a new person.

Imports to use:
    import { useUI } from '../../context/UIContext';

Requirements:
- No props
- Reads setPanelMode, setBottomSheetOpen from useUI()
- Renders a <button> fixed at bottom-6 right-6 z-50
- Style: w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl shadow-lg flex items-center justify-center transition-colors
- Shows a + icon
- On click: setPanelMode('addPerson'), setBottomSheetOpen(true)
- Keep under 20 lines
```

---

## STEP 26 — src/components/layout/AppShell.tsx

```
Create the file: src/components/layout/AppShell.tsx

It is the top-level layout component that switches between desktop and mobile layouts.

Imports to use:
    import useMediaQuery from '../../hooks/useMediaQuery';
    import Sidebar from './Sidebar';
    import BottomSheet from './BottomSheet';
    import FAB from './FAB';
    import GraphCanvas from '../graph/GraphCanvas';

Requirements:
- No props
- Uses useMediaQuery('(max-width: 767px)') to detect mobile
- Desktop layout (isMobile false):
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 relative">
        <GraphCanvas />
      </div>
    </div>
- Mobile layout (isMobile true):
    <div className="relative h-screen bg-gray-950">
      <GraphCanvas />
      <FAB />
      <BottomSheet />
    </div>
- Keep under 30 lines
```

---

## STEP 27 — src/components/graph/NodeRenderer.ts

```
Create the file: src/components/graph/NodeRenderer.ts

It exports a Canvas2D node paint function for react-force-graph-2d with level-of-detail rendering.

Requirements:
- Export default function paintNode(node: any, ctx: CanvasRenderingContext2D, globalScale: number): void
- Draws a filled circle:
    radius = Math.sqrt(Math.max(0, node.val)) * 4
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = node.color
    ctx.fill()
- Level-of-detail label rendering:
    If globalScale >= 1.5: draw label for ALL nodes
    If globalScale >= 0.5: draw label only if node.val >= 3
    If globalScale < 0.5: draw no labels
- Label rendering:
    label = node.nickname || node.name
    fontSize = Math.max(8, 12 / globalScale)
    ctx.font = fontSize + 'px Sans-Serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f3f4f6'
    ctx.fillText(label, node.x, node.y + radius + fontSize * 0.8)
- Keep under 35 lines
```

---

## STEP 28 — src/components/graph/LinkRenderer.ts

```
Create the file: src/components/graph/LinkRenderer.ts

It exports a Canvas2D link paint function for react-force-graph-2d.

Requirements:
- Export default function paintLink(link: any, ctx: CanvasRenderingContext2D, globalScale: number): void
- Get source and target positions:
    const src = typeof link.source === 'object' ? link.source : { x: 0, y: 0 };
    const tgt = typeof link.target === 'object' ? link.target : { x: 0, y: 0 };
- Draw the line:
    ctx.beginPath()
    ctx.moveTo(src.x, src.y)
    ctx.lineTo(tgt.x, tgt.y)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
    ctx.lineWidth = Math.max(0.5, link.strength * 0.8)
    ctx.stroke()
- Draw link label only if globalScale >= 1.5:
    midX = (src.x + tgt.x) / 2
    midY = (src.y + tgt.y) / 2
    ctx.font = (10 / globalScale) + 'px Sans-Serif'
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.textAlign = 'center'
    ctx.fillText(link.label, midX, midY)
- Keep under 35 lines
```

---

## STEP 29 — src/components/graph/GraphCanvas.tsx

```
Create the file: src/components/graph/GraphCanvas.tsx

It is the main graph visualization component wrapping react-force-graph-2d.

Imports to use:
    import { useRef, useCallback } from 'react';
    import ForceGraph2D from 'react-force-graph-2d';
    import { useUI } from '../../context/UIContext';
    import useGraphData from '../../hooks/useGraphData';
    import paintNode from './NodeRenderer';
    import paintLink from './LinkRenderer';
    import { GRAPH_CONFIG } from '../../utils/constants';

Requirements:
- No props
- Gets graphData from useGraphData()
- Gets selectedNodeId, setSelectedNodeId, setPanelMode, setBottomSheetOpen from useUI()
- graphRef = useRef<any>(null)
- onNodeClick handler: receives node, calls setSelectedNodeId(node.id), setPanelMode('view'), setBottomSheetOpen(true)
- onBackgroundClick handler: calls setSelectedNodeId(null), setPanelMode('empty'), setBottomSheetOpen(false)
- Renders <ForceGraph2D> with:
    ref={graphRef}
    graphData={graphData}
    nodeCanvasObject={paintNode}
    nodeCanvasObjectMode={GRAPH_CONFIG.nodeCanvasObjectMode}
    linkCanvasObject={paintLink}
    linkCanvasObjectMode='replace'
    warmupTicks={GRAPH_CONFIG.warmupTicks}
    cooldownTicks={GRAPH_CONFIG.cooldownTicks}
    d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
    d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
    minZoom={GRAPH_CONFIG.minZoom}
    maxZoom={GRAPH_CONFIG.maxZoom}
    onNodeClick={onNodeClick}
    onBackgroundClick={onBackgroundClick}
    backgroundColor='#030712'
- Wrap in a <div className="w-full h-full">
- Keep under 50 lines
```

---

## STEP 30 — src/components/graph/GraphControls.tsx

```
Create the file: src/components/graph/GraphControls.tsx

It renders zoom controls overlaid on the graph canvas.

Requirements:
- Props interface:
    graphRef: React.RefObject<any>
- Renders a <div> positioned absolute top-4 right-4 flex flex-col gap-2 z-10
- Three buttons (variant='secondary', size='sm'):
    'Fit' → calls graphRef.current?.zoomToFit(400)
    '+' → calls graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)
    '−' → calls graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 400)
- Import Button from '../ui/Button'
- Keep under 30 lines
```

---

## STEP 31 — src/components/panels/EmptyState.tsx

```
Create the file: src/components/panels/EmptyState.tsx

It renders a placeholder shown when no person is selected.

Imports to use:
    import { useUI } from '../../context/UIContext';
    import Button from '../ui/Button';

Requirements:
- No props
- Reads setPanelMode, setBottomSheetOpen from useUI()
- Renders a centered <div> with:
    <p> text-gray-500 text-sm: 'Click a node or search to explore your network'
    A Button (primary) 'Add Person' that calls setPanelMode('addPerson') and setBottomSheetOpen(true)
- Outer div: flex flex-col items-center justify-center gap-4 p-8 flex-1 text-center
- Keep under 25 lines
```

---

## STEP 32 — src/components/panels/PersonDetail.tsx

```
Create the file: src/components/panels/PersonDetail.tsx

It shows the details of the selected person including their relationships.

Imports to use:
    import { useLiveQuery } from 'dexie-react-hooks';
    import { db } from '../../db/database';
    import { useUI } from '../../context/UIContext';
    import usePersonActions from '../../hooks/usePersonActions';
    import TagBadge from '../ui/TagBadge';
    import Button from '../ui/Button';
    import type { Person, Relationship } from '../../db/types';

Requirements:
- No props
- Reads selectedNodeId, setPanelMode, setSelectedNodeId from useUI()
- Uses useLiveQuery to load person: db.people.get(selectedNodeId!)
- Uses useLiveQuery to load relationships where sourceId or targetId equals selectedNodeId
- If no person: return null
- Renders in <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">:
    - Person name as <h2 className="text-xl font-semibold text-gray-100">
    - Nickname if present: <p className="text-gray-400 text-sm">
    - Notes if present: <p className="text-gray-300 text-sm">
    - Tags row: person.tags.map tag => <TagBadge key={tag} tag={tag} />
    - Relationships count: <p className="text-gray-400 text-sm">{relationships.length} connections</p>
    - Row of buttons: Edit (secondary), Add Connection (secondary), Delete (danger)
    - Edit → setPanelMode('editPerson')
    - Add Connection → setPanelMode('addRelationship')
    - Delete → calls remove(selectedNodeId!), then setSelectedNodeId(null), setPanelMode('empty')
- Keep under 60 lines
```

---

## STEP 33 — src/components/panels/PersonForm.tsx

```
Create the file: src/components/panels/PersonForm.tsx

It is the form for adding or editing a person.

Imports to use:
    import { useState, useEffect } from 'react';
    import { useLiveQuery } from 'dexie-react-hooks';
    import { db } from '../../db/database';
    import { useUI } from '../../context/UIContext';
    import usePersonActions from '../../hooks/usePersonActions';
    import Input from '../ui/Input';
    import TextArea from '../ui/TextArea';
    import TagInput from '../ui/TagInput';
    import Button from '../ui/Button';

Requirements:
- No props
- Reads panelMode, selectedNodeId, setPanelMode from useUI()
- isEdit = panelMode === 'editPerson'
- If isEdit, uses useLiveQuery to load the existing person from db.people.get(selectedNodeId!)
- Form state: name (string), nickname (string), notes (string), tags (string[])
- If isEdit and person loads, useEffect to populate form state with existing values
- On submit:
    if isEdit: calls update(selectedNodeId!, { name, nickname, notes, tags })
    else: calls add({ name, nickname, notes, tags })
    then setPanelMode('empty')
- Renders in <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">:
    <h2> 'Add Person' or 'Edit Person'
    Input for name (required)
    Input for nickname
    TextArea for notes
    TagInput for tags
    Row: Cancel button (secondary) → setPanelMode('empty'), Save button (primary) → submit
- Keep under 70 lines
```

---

## STEP 34 — src/components/panels/RelationshipForm.tsx

```
Create the file: src/components/panels/RelationshipForm.tsx

It is the form for adding a relationship between two people.

Imports to use:
    import { useState } from 'react';
    import { useUI } from '../../context/UIContext';
    import useRelationshipActions from '../../hooks/useRelationshipActions';
    import PersonPicker from '../ui/PersonPicker';
    import Input from '../ui/Input';
    import Button from '../ui/Button';

Requirements:
- No props
- Reads selectedNodeId, setPanelMode from useUI()
- sourceId = selectedNodeId
- Form state: targetId (number | null), label (string), context (string), strength (number, default 3)
- On submit: calls add({ sourceId: sourceId!, targetId: targetId!, label, context, strength }), then setPanelMode('view')
- Renders in <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">:
    <h2> 'Add Connection'
    PersonPicker for target (label='Connect to', exclude=[sourceId!])
    Input for label (placeholder='friend, coworker, sibling...')
    Input for context (placeholder='How do you know them?')
    Input type='range' min=1 max=5 for strength with label showing 'Strength: {strength}'
    Row: Cancel (secondary) → setPanelMode('view'), Save (primary) → submit (disabled if !targetId || !label)
- Keep under 60 lines
```

---

## STEP 35 — src/components/panels/SearchPanel.tsx

```
Create the file: src/components/panels/SearchPanel.tsx

It renders a search input and shows filtered people results.

Imports to use:
    import { useUI } from '../../context/UIContext';
    import useSearch from '../../hooks/useSearch';

Requirements:
- No props
- Reads searchQuery, setSearchQuery, setSelectedNodeId, setPanelMode, setBottomSheetOpen from useUI()
- results = useSearch(searchQuery)
- Renders a <div className="p-3 border-b border-gray-800">:
    <input> type='search' placeholder='Search people...' value={searchQuery} onChange updates setSearchQuery
    Input Tailwind: w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500
- If searchQuery is not empty and results.length > 0, renders a list below:
    Each result: clickable <div> showing person.name and tags as small gray text
    On click: setSelectedNodeId(person.id!), setPanelMode('view'), setSearchQuery(''), setBottomSheetOpen(true)
- Result item: px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 cursor-pointer
- Keep under 45 lines
```

---

## STEP 36 — src/App.tsx

```
Create the file: src/App.tsx

It is the root React component.

Imports to use:
    import { UIProvider } from './context/UIContext';
    import AppShell from './components/layout/AppShell';

Requirements:
- Export default function App()
- Renders:
    <UIProvider>
      <AppShell />
    </UIProvider>
- Keep under 12 lines
```

---

## STEP 37 — src/main.tsx

```
Create the file: src/main.tsx

It is the Vite entry point.

Requirements:
- Import StrictMode from 'react'
- Import createRoot from 'react-dom/client'
- Import './index.css'
- Import App from './App'
- createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
- Keep under 10 lines
```

---

## STEP 38 — src/db/exportService.ts

```
Create the file: src/db/exportService.ts

It exports functions to export and import the full database as a JSON file.

Imports to use:
    import { db } from './database';
    import type { Person, Relationship } from './types';

Requirements:
- Export interface DatabaseExport:
    version: number
    exportedAt: number
    people: Person[]
    relationships: Relationship[]

- Export async function exportDatabase(): Promise<void>
    - Loads all people and relationships from db
    - Creates DatabaseExport object with version 1, exportedAt Date.now()
    - Converts to JSON blob and triggers browser download as 'peoplemap-export.json'

- Export async function importDatabase(file: File): Promise<void>
    - Reads file as text, parses JSON
    - Validates it has people array and relationships array
    - Inside a Dexie transaction: clears both tables, then bulkPut people, then bulkPut relationships
    - Throws error if validation fails

- Keep under 50 lines
```

---

## STEP 40 — src/db/seedData.ts

```
Create the file: src/db/seedData.ts

It seeds the database with demo people and relationships for testing.

Imports to use:
    import { db } from './database';

Requirements:
- Export async function seedDatabase(): Promise<void>
- Only seeds if the database is empty: check db.people.count() === 0
- Creates 10 realistic people with varied names, nicknames, tags (mix of 'work', 'college', 'family', 'friends')
- Creates 12 relationships between them with varied labels (friend, coworker, sibling, mentor) and strengths 1-5
- Uses db.people.bulkAdd() and db.relationships.bulkAdd()
- Sets createdAt and updatedAt to Date.now() for all records
- Keep under 60 lines
```

---

## NOTES

**Step 39** — Generate PWA icons manually and put them in public/:
- icon-192.png (192x192)
- icon-512.png (512x512)
Use any icon generator or just duplicate a square PNG at those sizes.

**Testing after Step 37:** run `npm run dev` and open in browser.
**Testing PWA on phone:** run `npm run build && npm run preview -- --host`, then open http://YOUR-PC-IP:4173 on your phone and tap "Add to Home Screen".
