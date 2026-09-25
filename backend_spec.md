# Backend API & Database Specification

This document details the database schema and REST API endpoints required to transition the Synco Software application from a `localStorage`-based mock architecture to a production-grade backend (e.g. Node.js Express, Go, or Python FastAPI) with a relational database (e.g., PostgreSQL).

---

## 1. Database Schema Design (Entity-Relationship)

To fully support the app's current features (Excel importing, progress tracking, CNC/Milling/EDM stage operations, fleet management, and audit logs), the database should be divided into the following tables:

### 1.1 `work_orders` Table
Stores the top-level work order document.
*   `id`: `VARCHAR(255) PRIMARY KEY` (e.g., "WO-9801")
*   `customer`: `VARCHAR(255) NOT NULL`
*   `priority`: `VARCHAR(50) NOT NULL` (e.g., 'Low', 'Medium', 'High', 'Critical')
*   `status`: `VARCHAR(50) NOT NULL DEFAULT 'Pending'` (e.g., 'Running', 'Completed', 'Pending', 'Delayed', 'Material Shortage')
*   `due_date`: `DATE`
*   `created_at`: `TIMESTAMP DEFAULT NOW()`
*   `updated_at`: `TIMESTAMP DEFAULT NOW()`

### 1.2 `work_order_metadata` Table
Stores arbitrary sheet header data extracted from Excel (for flexible specs).
*   `id`: `SERIAL PRIMARY KEY`
*   `work_order_id`: `VARCHAR(255) REFERENCES work_orders(id) ON DELETE CASCADE`
*   `meta_key`: `VARCHAR(100) NOT NULL` (e.g., 'DRAWING NO', 'REV', 'MATERIAL', 'PO VALUE')
*   `meta_value`: `VARCHAR(255)`

### 1.3 `jobs` Table
Each Work Order has multiple sub-parts (Jobs) parsed from the Excel sheets.
*   `id`: `VARCHAR(255) PRIMARY KEY` (e.g., "WO-9801/1")
*   `work_order_id`: `VARCHAR(255) REFERENCES work_orders(id) ON DELETE CASCADE`
*   `name`: `VARCHAR(255) NOT NULL` (e.g., "PUNCH SHOE")
*   `qty`: `INTEGER DEFAULT 1`
*   `material`: `VARCHAR(255)`
*   `catalog_size`: `VARCHAR(255)`
*   `dimensions`: `VARCHAR(100)` (e.g. "L x W x H")
*   `supplier`: `VARCHAR(255)`
*   `start_date`: `DATE`
*   `expected_date`: `DATE`
*   `process_path`: `VARCHAR(100)` (e.g., "M1-C2-G1")
*   `progress`: `INTEGER DEFAULT 0` (Calculated or saved state, 0-100)
*   `status`: `VARCHAR(50) DEFAULT 'Transit'`

### 1.4 `job_processes` Table
Stores stage-specific hourly schedules and status for every job.
*   `id`: `SERIAL PRIMARY KEY`
*   `job_id`: `VARCHAR(255) REFERENCES jobs(id) ON DELETE CASCADE`
*   `department`: `VARCHAR(50) NOT NULL` (e.g., 'cnc', 'milling', 'heat', 'grinding', 'wiring', 'edm', 'assembly')
*   `estimated_hours`: `DECIMAL(6,2) DEFAULT 0`
*   `actual_hours`: `DECIMAL(6,2) DEFAULT 0`
*   `status`: `VARCHAR(50) DEFAULT 'N/A'` (e.g., 'Pending', 'In Progress', 'Completed', 'N/A')
*   `assigned_machine`: `VARCHAR(100)` (e.g., "VMC-02")

### 1.5 `machines` Table
Tracks real-time status and productivity of CNC shop machines.
*   `id`: `VARCHAR(100) PRIMARY KEY` (e.g., "CNC-01")
*   `name`: `VARCHAR(255) NOT NULL`
*   `type`: `VARCHAR(50)` (e.g., 'CNC', 'MIL', 'GRN', 'EDM', 'LAT')
*   `status`: `VARCHAR(50) NOT NULL DEFAULT 'idle'` (e.g., 'running', 'idle', 'setup', 'error', 'maintenance')
*   `active_job_id`: `VARCHAR(255)` (nullable, references jobs or job_processes)
*   `efficiency`: `INTEGER DEFAULT 0` (0-100)
*   `runtime_hours`: `INTEGER DEFAULT 0`
*   `last_maintenance`: `DATE`

### 1.6 `purchases` Table
Tracks materials or tooling procurement.
*   `id`: `VARCHAR(100) PRIMARY KEY` (e.g., "PO-7712")
*   `work_order_id`: `VARCHAR(255) REFERENCES work_orders(id) ON DELETE SET NULL`
*   `vendor`: `VARCHAR(255) NOT NULL`
*   `item_name`: `VARCHAR(255) NOT NULL`
*   `specs`: `VARCHAR(255)`
*   `amount`: `DECIMAL(10,2)`
*   `status`: `VARCHAR(50) DEFAULT 'Ordered'` (e.g., 'Approved', 'Processing', 'Delivered', 'Ordered')
*   `created_at`: `TIMESTAMP DEFAULT NOW()`

### 1.7 `audit_logs` Table
Audit ledger of updates.
*   `id`: `SERIAL PRIMARY KEY`
*   `user_name`: `VARCHAR(100) NOT NULL`
*   `action`: `TEXT NOT NULL`
*   `target_id`: `VARCHAR(255)` (optional ID referenced)
*   `created_at`: `TIMESTAMP DEFAULT NOW()`

---

## 2. API Endpoints Specifications (HTTP REST)

### 2.1 Work Orders Resource (`/api/work-orders`)

*   `GET /api/work-orders`
    *   **Description**: Retrieves list of all work orders (includes parameters to filter by priority, status, and search query).
    *   **Response**: `200 OK` with JSON array of work orders.
*   `POST /api/work-orders`
    *   **Description**: Manually creates a new work order.
    *   **Body**: JSON representing a work order entity.
    *   **Response**: `201 Created` with the new work order.
*   `GET /api/work-orders/:id`
    *   **Description**: Fetch detailed info of a work order, including metadata, sub-jobs, and associated purchases.
    *   **Response**: `200 OK` with full detail graph or `404 Not Found`.
*   `PUT /api/work-orders/:id`
    *   **Description**: Modify top-level attributes (status, priority, due date) or sub-jobs.
    *   **Response**: `200 OK`.
*   `DELETE /api/work-orders/:id`
    *   **Description**: Delete a work order (and cascading jobs/metadata).
    *   **Response**: `204 No Content`.
*   `POST /api/work-orders/import`
    *   **Description**: Import a parsed payload generated from Excel (handles atomic inserts of Work Order, metadata, and all sub-jobs/processes).
    *   **Response**: `201 Created` with confirmation payload.

### 2.2 Sub-Jobs Resource (`/api/jobs`)

*   `GET /api/jobs`
    *   **Description**: Lists all individual sub-jobs across all active work orders (used for the global Jobs monitor dashboard).
    *   **Response**: `200 OK` with jobs array.
*   `GET /api/jobs/:id`
    *   **Description**: Retrieve status details, processes checklist, and tracking history for a single job.
    *   **Response**: `200 OK`.
*   `PATCH /api/jobs/:id/processes/:department`
    *   **Description**: Update estimated hours, actual hours, status, or assigned machine for a job process stage (e.g. CNC routing, Assembly).
    *   **Response**: `200 OK`.

### 2.3 CNC Machines Resource (`/api/machines`)

*   `GET /api/machines`
    *   **Description**: Get current fleet operational metrics and active jobs.
    *   **Response**: `200 OK`.
*   `POST /api/machines`
    *   **Description**: Register a new machine into the shop floor.
    *   **Response**: `201 Created`.
*   `PATCH /api/machines/:id`
    *   **Description**: Live telemetry update: change status (e.g., from `running` to `error`), update efficiency metrics, runtime, or log maintenance.
    *   **Response**: `200 OK`.

### 2.4 Purchases Resource (`/api/purchases`)

*   `GET /api/purchases`
    *   **Description**: Get purchase ledger / lists.
    *   **Response**: `200 OK`.
*   `POST /api/purchases`
    *   **Description**: Create PO requisition.
    *   **Response**: `201 Created`.
*   `PATCH /api/purchases/:id`
    *   **Description**: Approve or update shipment tracking status.
    *   **Response**: `200 OK`.

### 2.5 System Audits (`/api/audit-logs`)

*   `GET /api/audit-logs`
    *   **Description**: Pageable query of action events.
    *   **Response**: `200 OK`.
*   `POST /api/audit-logs`
    *   **Description**: Write a new audit action payload.
    *   **Response**: `201 Created`.

### 2.6 Metrics & Aggregations (`/api/analytics`)

*   `GET /api/analytics/kpi`
    *   **Description**: Computes metrics dynamically: total production counts, completion ratios, pending queues, and active delay/alert tallies.
    *   **Response**: `200 OK`.
*   `GET /api/analytics/throughput`
    *   **Description**: Aggregates comparative volumes (RFQ, Planned, Actual) over the last 12 months for chart display.
    *   **Response**: `200 OK`.
