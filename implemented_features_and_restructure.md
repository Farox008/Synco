# Project Status & Restructuring Plan

This document outlines the features currently implemented in the Synco Software application and proposes a structured approach for reorganizing the codebase as it scales towards a production-ready system with a real backend.

---

## 1. Currently Implemented Features

The application currently functions as a **Serverless Frontend SPA** using Next.js (App Router), React, and Tailwind CSS. Data persistence is handled via a mocked database layer leveraging `localStorage` (`src/services/db.ts`) and React Context (`DatabaseContext.tsx`). 

### Core Modules & Capabilities:
*   **Dashboard (`/`)**: 
    *   Displays dynamic production statistics and KPI metrics.
    *   Shows status breakdowns, active job matrices, and delay alerts.
*   **Work Orders Management (`/work-orders`)**: 
    *   Listings with filtering and batch operations.
    *   Support for manual creation, CSV exporting, and Excel file importing.
    *   **Work Order Details (`/work-orders/[id]`)**: Granular views of sub-jobs, bill of materials (purchases), process paths, and CNC programs.
*   **Jobs Tracking (`/jobs`)**: 
    *   Global view of all jobs in transit or production.
    *   **Job Details (`/jobs/[id]`)**: Routing detail views for individual job stages (CNC, Milling, EDM, etc.).
*   **Machine Fleet Monitoring (`/machines`)**: 
    *   Interactive dashboard showing live efficiency status (`running`, `idle`, `setup`, `error`).
    *   Maintenance histories and operational metrics.
*   **Reports & Analytics (`/reports`)**: 
    *   Comparative throughput charts.
    *   Operational delay and bottleneck analytics.
*   **System Audit Logs (`/audit-logs`)**: 
    *   Aggregated history of user actions and system events.

---

## 2. Identified Pain Points in Current Architecture

While the `localStorage` mock is excellent for rapid prototyping, the current structure has limitations that need addressing before moving to production:
1.  **Context Re-renders**: Wrapping the entire database state in `DatabaseContext` can cause unnecessary re-renders across the entire application whenever any single table updates.
2.  **Tightly Coupled UI and Data**: UI components directly consume the local mock database instead of standard data-fetching patterns (like REST or GraphQL). This makes swapping to a real backend tedious.
3.  **Monolithic Folders**: Having all components grouped into `src/components/dashboard` or `src/components/ui` can become chaotic as the application grows.

---

## 3. Proposed Restructuring Plan

To transition seamlessly to the architecture defined in `backend_spec.md`, the codebase should be restructured using the following multi-phase approach.

### Phase 1: Feature-Sliced Design (Frontend Modularity)
Instead of grouping files by technical type (e.g., all components together, all contexts together), organize them by **Feature Domains**:
```text
src/
 ├── app/                  # Only Next.js routing, layouts, and page entry-points
 ├── features/             # Domain-specific modules
 │    ├── work-orders/     # Everything related to work orders
 │    │    ├── components/ # WorkOrderTable, ImportModal, etc.
 │    │    ├── hooks/      # useWorkOrders, useCreateWorkOrder
 │    │    └── api/        # Data fetching logic for work orders
 │    ├── machines/
 │    └── jobs/
 ├── shared/               # Shared across the entire app
 │    ├── components/ui/   # Reusable UI (Buttons, Inputs, Modals)
 │    ├── lib/             # Utility functions (date formatting, etc.)
 │    └── types/           # Global TypeScript interfaces
```

### Phase 2: Decoupling State with Server-State Libraries
Replace the custom `DatabaseContext` with a robust data-fetching library like **TanStack Query (React Query)** or **SWR**.
*   **Why?** React Query handles caching, background updates, and loading states natively. 
*   **How it helps the mock:** You can mock the API calls inside React Query's fetcher functions (`queryFn`). When the real backend is ready, you only change the `fetch` URL, and the UI components require **zero changes**.

### Phase 3: Introducing Next.js API Routes / Server Actions
Before building a separate backend (Node.js/Python), use Next.js's built-in backend capabilities to act as a bridge.
1.  Create `src/app/api/...` route handlers.
2.  Move the `db.ts` logic into these server-side routes (it can still read/write to a local JSON file or a lightweight SQLite DB as a stepping stone).
3.  Update the frontend to `fetch('/api/work-orders')` instead of directly importing `db.ts`.

### Phase 4: Full Database Integration
Following the `backend_spec.md` schema:
1.  Stand up the PostgreSQL database.
2.  Integrate an ORM (like **Prisma** or **Drizzle**).
3.  Replace the Next.js API route dummy logic with real database queries.
4.  Remove all legacy `localStorage` fallback code.

## 4. Immediate Next Steps

If you are looking to start restructuring right now, I recommend:
1.  **Create the `src/features` directory** and start migrating domain-specific components out of the generic `src/components/` folder.
2.  **Introduce TanStack Query** to wrap your existing `dbService` calls, removing the reliance on global React Context for data fetching.
