# PeopleMap — Bug Fix & Vercel Deployment Design

**Date:** 2026-03-20
**Status:** Approved

## Goal

Get the existing PeopleMap PWA running correctly and deployed to Vercel so it's accessible on iPhone as an installable PWA — free, no self-hosting.

## Phase 1: Bug Audit & Fix

Systematically read every file in `src/` and fix all runtime and TypeScript errors. Priority areas based on known issues:

- **Hooks:** `useLiveQuery` usage patterns (destructuring undefined crashes), query structure
- **Services:** Correct Dexie table references, cascade delete logic
- **Components:** Prop mismatches, missing imports, incorrect context usage
- **Context:** Duplicate type definitions, incorrect state initialization
- **Graph:** NodeRenderer/LinkRenderer Canvas2D API correctness, GraphCanvas wiring

Constraint: follow all rules in CLAUDE.md — no `any`, Dexie as source of truth, `useLiveQuery` for all reads, service files for all mutations.

## Phase 2: GitHub Repository

Initialize a git repo in the project root, create a `.gitignore` appropriate for Vite + Node, commit all source files.

## Phase 3: Vercel Deployment

Install Vercel CLI via `pnpm i -g vercel`, run `vercel` from the project root, configure:
- **Framework:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Result: a public HTTPS URL (e.g. `peoplemap.vercel.app`).

## Phase 4: iPhone PWA Install

User opens the Vercel URL in Safari on iPhone → taps Share → "Add to Home Screen" → app installs as standalone PWA with IndexedDB storage local to the device.

## Hosting Cost

Free. Vercel Hobby tier covers unlimited personal projects with no usage charges for a static SPA.

## User Action Required (Manual)

After creating Vercel account: go to **Account Settings → Privacy** and disable "Allow Vercel to use my data to train AI models."

## Success Criteria

1. `npm run build` completes with zero errors
2. App loads in browser with graph canvas visible
3. Can add a person, add a relationship, see them in the graph
4. Vercel deployment URL is live and accessible
5. App installs to iPhone home screen and works offline
