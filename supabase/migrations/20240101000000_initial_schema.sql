-- Initial Schema Migration from Prisma to Supabase

CREATE TABLE work_orders (
  id VARCHAR(255) PRIMARY KEY,
  customer VARCHAR(255) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE work_order_metadata (
  id SERIAL PRIMARY KEY,
  work_order_id VARCHAR(255) NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  meta_key VARCHAR(100) NOT NULL,
  meta_value VARCHAR(255)
);

CREATE TABLE jobs (
  id VARCHAR(255) PRIMARY KEY,
  work_order_id VARCHAR(255) NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  material VARCHAR(255),
  catalog_size VARCHAR(255),
  dimensions VARCHAR(100),
  supplier VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE,
  expected_date TIMESTAMP WITH TIME ZONE,
  process_path VARCHAR(100),
  progress INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Transit'
);

CREATE TABLE job_processes (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  department VARCHAR(50) NOT NULL,
  estimated_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  actual_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'N/A',
  assigned_machine VARCHAR(100)
);

CREATE TABLE machines (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'idle',
  active_job_id VARCHAR(255),
  efficiency INTEGER NOT NULL DEFAULT 0,
  runtime_hours INTEGER NOT NULL DEFAULT 0,
  last_maintenance TIMESTAMP WITH TIME ZONE
);

CREATE TABLE purchases (
  id VARCHAR(100) PRIMARY KEY,
  work_order_id VARCHAR(255) REFERENCES work_orders(id) ON DELETE SET NULL,
  vendor VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  specs VARCHAR(255),
  amount DECIMAL(10,2),
  status VARCHAR(50) NOT NULL DEFAULT 'Ordered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  action TEXT NOT NULL,
  target_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE departments (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  employee_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

CREATE TABLE production_lines (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id VARCHAR(255),
  description TEXT,
  employee_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

CREATE TABLE employment_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

CREATE TABLE shifts (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time VARCHAR(50) NOT NULL,
  end_time VARCHAR(50) NOT NULL,
  break_duration INTEGER NOT NULL DEFAULT 45,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

-- Note: We link Employee Auth to Supabase auth.users in the future,
-- but for now we keep the structure for application data.
CREATE TABLE employees (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(255),
  gender VARCHAR(50),
  date_of_birth VARCHAR(50),
  nationality VARCHAR(100),
  profile_picture TEXT,
  department_id VARCHAR(255) REFERENCES departments(id),
  production_line_id VARCHAR(255) REFERENCES production_lines(id),
  designation VARCHAR(255) NOT NULL,
  employment_type_id VARCHAR(255) REFERENCES employment_types(id),
  joining_date VARCHAR(50),
  shift_id VARCHAR(255) REFERENCES shifts(id),
  employment_status VARCHAR(50) NOT NULL DEFAULT 'Active',
  email VARCHAR(255),
  phone_number VARCHAR(50),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  skills TEXT,
  
  -- Auth & RBAC (These will eventually be mapped to Supabase Auth roles)
  username VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),
  account_status VARCHAR(50) NOT NULL DEFAULT 'active',
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE
);
