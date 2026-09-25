# Synco Software API & Data Architecture

This application is built as a Next.js single-page application (SPA) client that operates completely serverless on the frontend. There are no backend HTTP API endpoints (`/api/...`) or remote database connections. Instead, it utilizes a client-side architecture backed by `localStorage` and a local service layer to mimic API queries.

---

## 1. Local Database & Service Layer (`dbService`)

The "API" of the application is represented by the `dbService` located in [db.ts](file:///c:/Users/anaki/Desktop/wok%20sheit/Synco_Software/synco_app/src/services/db.ts). It acts as the controller/provider interface for components to query and mutate data.

### Data Schema (Store Version 5: `synco_local_db_v5`)

The simulated database contains four tables:

```typescript
export interface LocalDB {
  workOrders: any[];
  jobs: any[];
  metrics: any[];
  machines: any[];
}
```

### Mock API Methods (`dbService`)

| Service Method | Type | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `init()` | Read/Write | None | Initializes database with seeded mock data if not already existing. |
| `save(data)` | Write | `data: LocalDB` | Syncs state to client's `localStorage`. |
| `getWorkOrders()` | Read | None | Retrieves all active work orders. |
| `addWorkOrder(order)` | Write | `order: any` | Inserts a new work order or replaces one with matching ID. |
| `deleteWorkOrder(id)` | Write | `id: string` | Deletes a work order by ID. |
| `updateWorkOrder(id, updates)` | Write | `id: string, updates: any` | Updates fields for the specified work order. |
| `getMachines()` | Read | None | Retrieves CNC machine fleet state. |
| `addMachine(machine)` | Write | `machine: any` | Adds or replaces a machine by ID. |
| `updateMachine(id, updates)` | Write | `id: string, updates: any` | Modifies dynamic metrics/status for a machine. |
| `getWorkOrderById(id)` | Read | `id: string` | Finds a specific work order by ID. |
| `clearAll()` | Write | None | Resets local storage and rebuilds the initial database. |

---

## 2. Frontend Page Routes (Next.js App Router)

The application endpoints accessed by users represent client views that read from the `dbService` layer:

*   **Dashboard (`/`)**
    *   *Path*: `src/app/page.tsx`
    *   *Role*: Displays dynamic production statistics, status breakdowns, active job matrices, work order lists, delay alerts, fleet status, recent purchases, and audit logs.
*   **Work Orders (`/work-orders`)**
    *   *Path*: `src/app/work-orders/page.tsx`
    *   *Role*: Provides listings, filters, batch operations, CSV exporting, manual creation forms, and Excel importing.
*   **Work Order Details (`/work-orders/[id]`)**
    *   *Path*: `src/app/work-orders/[...id]/page.tsx`
    *   *Role*: Renders specific work order details, sub-jobs, bill of materials/purchases, processes path, and CNC programs.
*   **Jobs List (`/jobs`)**
    *   *Path*: `src/app/jobs/page.tsx`
    *   *Role*: Lists all jobs in transit, out, or in production.
*   **Job Details (`/jobs/[id]`)**
    *   *Path*: `src/app/jobs/[...id]/page.tsx`
    *   *Role*: Specific routing detail views for individual job stages and operations.
*   **Machine Fleet (`/machines`)**
    *   *Path*: `src/app/machines/page.tsx`
    *   *Role*: Interactive dashboard showing live efficiency status (`running`, `idle`, `setup`, `error`, `maintenance`) and maintenance histories.
*   **Reports & Analytics (`/reports`)**
    *   *Path*: `src/app/reports/page.tsx`
    *   *Role*: Provides analytics dashboards, comparative throughput charts, and operational delays metrics.
*   **System Audit Logs (`/audit-logs`)**
    *   *Path*: `src/app/audit-logs/page.tsx`
    *   *Role*: Aggregates detailed operation events and histories across components.
