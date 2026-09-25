# AI Agent Coding Guidelines: Synco Software

This document provides system instructions and codebase architectural context for any AI assistant (e.g., Claude, Cursor, Copilot) working on the Synco Software project. Please adhere to these guidelines closely to ensure consistency.

## 1. Project Overview & Architecture

*   **Framework**: Next.js 16.2 (App Router).
*   **Language**: TypeScript / React 19.
*   **Styling**: Tailwind CSS v4.
*   **Current Architecture**: "Serverless Frontend SPA".
    *   **No backend API**: Currently, there are no real backend services or databases connected. Do not implement server-side `fetch` calls to non-existent APIs.
    *   **Database Mock**: The application state and database are mocked using a client-side local storage solution located at `src/services/db.ts`. 

## 2. Directory Structure

*   `src/app/`: Next.js App Router pages (`/`, `/work-orders`, `/jobs`, `/machines`, `/reports`, `/audit-logs`).
*   `src/components/`: Reusable UI components. Subdivided into domain folders (e.g., `dashboard/`, `work-orders/`, `ui/`).
*   `src/context/`: React Context providers (`DatabaseContext.tsx`, `UIContext.tsx`) that manage global state and interact with the local db service.
*   `src/services/`: Contains `db.ts` which encapsulates `localStorage` interactions to simulate a database.
*   `src/data/`: Mock data or static resources.

## 3. Data & State Management

*   **Database Interaction**: All persistent state updates must go through `src/services/db.ts`. The interface `LocalDB` specifies the mock tables (`workOrders`, `jobs`, `metrics`, `machines`).
*   **Context API**: Components should typically use hooks from `src/context/DatabaseContext.tsx` to read or mutate data, rather than importing `db.ts` directly, to ensure React component re-rendering.
*   **Migration Future**: Eventually, the app will transition to a real backend (see `backend_spec.md`). Until then, all new features must mock data using `db.ts`.

## 4. Coding Conventions

1.  **TypeScript**: Always use strict typing. Define interfaces for new data models in `db.ts` or near the components that use them.
2.  **Tailwind CSS**: Use Tailwind utility classes for all styling. Rely on `src/app/globals.css` only for base configurations or CSS variables.
3.  **Components**: Use functional components with hooks. Keep components modular. If a page file (`page.tsx`) gets too large, extract sections into `src/components/`.
4.  **Icons**: Use `lucide-react` for all icons.
5.  **Charts**: Use `recharts` for data visualization.

## 5. File References

*   **`backend_spec.md`**: The design document outlining the future relational database schema and REST API. Use this to understand the data models we are building towards.
*   **`api_endpoints.md`**: Explains the current routing and the mock API methods in `dbService`.

## 6. Agent Rules

*   **DO NOT** add Node.js backend dependencies (e.g., Express, pg, Prisma) to this Next.js project right now.
*   **DO NOT** create `/api/` route handlers in Next.js unless specifically requested to start the backend migration.
*   **DO** use client-side hooks (`useEffect`, `useState`) and the `DatabaseContext` for data fetching.
*   **DO** ensure mobile responsiveness using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
