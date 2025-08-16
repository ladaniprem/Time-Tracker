-- CREATE TABLE employees (
--   id BIGSERIAL PRIMARY KEY,
--   employee_id VARCHAR(50) UNIQUE NOT NULL,
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   phone VARCHAR(20),
--   department VARCHAR(100),
--   position VARCHAR(100),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE attendance_records (
--   id BIGSERIAL PRIMARY KEY,
--   employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
--   date DATE NOT NULL,
--   in_time TIMESTAMP,
--   out_time TIMESTAMP,
--   late_minutes INTEGER DEFAULT 0,
--   early_minutes INTEGER DEFAULT 0,
--   total_hours DOUBLE PRECISION DEFAULT 0,
--   status VARCHAR(20) DEFAULT 'present',
--   notes TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE(employee_id, date)
-- );

-- CREATE TABLE departments (
--   id BIGSERIAL PRIMARY KEY,
--   name VARCHAR(100) UNIQUE NOT NULL,
--   description TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE attendance_settings (
--   id BIGSERIAL PRIMARY KEY,
--   work_start_time TIME DEFAULT '09:00:00',
--   work_end_time TIME DEFAULT '17:00:00',
--   late_threshold_minutes INTEGER DEFAULT 15,
--   early_leave_threshold_minutes INTEGER DEFAULT 15,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO attendance_settings (id) VALUES (1);

-- ==============================
-- Employees table
-- ==============================
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Attendance records table
-- ==============================
CREATE TABLE attendance_records (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  in_time TIMESTAMP,
  out_time TIMESTAMP,
  late_minutes INTEGER DEFAULT 0,
  early_minutes INTEGER DEFAULT 0,
  total_hours DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(20) DEFAULT 'present', -- present, absent, leave, holiday
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- ==============================
-- Departments table
-- ==============================
CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Attendance settings table (extended)
-- ==============================
CREATE TABLE attendance_settings (
  id BIGSERIAL PRIMARY KEY,
  work_start_time TIME DEFAULT '09:00:00',
  work_end_time TIME DEFAULT '17:00:00',
  late_threshold_minutes INTEGER DEFAULT 15,
  early_leave_threshold_minutes INTEGER DEFAULT 15,
  working_days_per_week INT DEFAULT 5,
  weekend_days TEXT[] DEFAULT ARRAY['Saturday','Sunday'],
  holiday_dates DATE[] DEFAULT '{}',
  overtime_enabled BOOLEAN DEFAULT false,
  overtime_rate FLOAT DEFAULT 0.0,
  break_duration_minutes INT DEFAULT 60,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Seed default settings row
-- ==============================
INSERT INTO attendance_settings (id) VALUES (1);
