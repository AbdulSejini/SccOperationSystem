-- ============================================================
-- Saudi Cable Dashboard - Supabase Database Setup
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Machine Types Table
CREATE TABLE IF NOT EXISTS machine_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Machines Table
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  area TEXT,
  section TEXT,
  status TEXT DEFAULT 'idle' CHECK (status IN ('running', 'idle', 'stopped', 'maintenance')),
  speed FLOAT DEFAULT 0,
  target_speed FLOAT DEFAULT 0,
  temperature FLOAT DEFAULT 25,
  oee FLOAT DEFAULT 0,
  operator TEXT,
  location_x FLOAT,
  location_y FLOAT,
  notes TEXT,
  description TEXT,
  manufacturer TEXT,
  country_of_origin TEXT,
  installed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if table already exists (safe to run multiple times)
DO $$ BEGIN
  ALTER TABLE machines ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE machines ADD COLUMN IF NOT EXISTS manufacturer TEXT;
  ALTER TABLE machines ADD COLUMN IF NOT EXISTS country_of_origin TEXT;
  ALTER TABLE machines ADD COLUMN IF NOT EXISTS installed_date DATE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Spare Parts Checklist Table
CREATE TABLE IF NOT EXISTS spare_parts_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  part_number TEXT,
  is_available BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  last_replaced TIMESTAMPTZ,
  next_replacement TIMESTAMPTZ,
  checked_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spare parts by machine
CREATE INDEX IF NOT EXISTS idx_spare_parts_machine ON spare_parts_checklist(machine_id);

-- ============================================================
-- Enable Row Level Security (RLS) - Allow all for now
-- ============================================================
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts_checklist ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth required for now)
CREATE POLICY "Allow all on machines" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on machine_types" ON machine_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on spare_parts_checklist" ON spare_parts_checklist FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Insert Machine Types
-- ============================================================
INSERT INTO machine_types (code, name_en, name_ar) VALUES
  ('CW', 'Cold Welding', 'لحام بارد'),
  ('IW', 'Insulation Wrapping', 'لف العزل'),
  ('BN', 'Bunching', 'تجميع'),
  ('CL', 'Cabling', 'تكبيل'),
  ('ST', 'Stranding', 'جدل'),
  ('TU', 'Twisting Unit', 'وحدة لي'),
  ('XL', 'Extrusion Line', 'خط بثق'),
  ('XT', 'Stranding', 'جدل'),
  ('AR', 'Armoring', 'تدريع'),
  ('BC', 'Bunching', 'تجميع'),
  ('DT', 'Drawing', 'سحب'),
  ('RW', 'Rewinding', 'إعادة لف'),
  ('PS', 'Processing', 'معالجة'),
  ('CV', 'CV Line', 'خط CV'),
  ('LX', 'Extrusion', 'بثق'),
  ('SC', 'Screening', 'فحص'),
  ('JKT', 'Jacketing', 'تغليف'),
  ('REW', 'Rewinding', 'إعادة لف'),
  ('CAB', 'Cabling', 'تكبيل'),
  ('TWI', 'Twisting', 'لي'),
  ('MT', 'Testing', 'اختبار'),
  ('ARM', 'Armoring', 'تدريع'),
  ('SILO', 'Storage', 'تخزين')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Insert Existing Machines (47 from current DataContext)
-- ============================================================
INSERT INTO machines (id, name, area, section, type, status, speed, target_speed, temperature, oee, operator) VALUES
  -- LV CABLE SECTION - PCP-1
  ('DT-1', 'Drawing Unit 1', 'PCP-1', 'LV-Cable', 'drawing', 'running', 28.5, 32, 45, 78, 'Ahmed Ali'),
  ('DT-2', 'Drawing Unit 2', 'PCP-1', 'LV-Cable', 'drawing', 'running', 30.2, 32, 43, 82, 'Mohammed Hassan'),
  ('DT-4', 'Drawing Unit 4', 'PCP-1', 'LV-Cable', 'drawing', 'idle', 0, 32, 25, 0, NULL),
  ('BC-1', 'Bunching 1', 'PCP-1', 'LV-Cable', 'bunching', 'running', 850, 900, 38, 75, 'Khalid Omar'),
  ('BC-2', 'Bunching 2', 'PCP-1', 'LV-Cable', 'bunching', 'maintenance', 0, 900, 25, 0, NULL),
  ('AR-2', 'Armoring 2', 'PCP-1', 'LV-Cable', 'armoring', 'running', 15.5, 18, 42, 71, 'Saeed Ahmed'),
  -- LV CABLE SECTION - PCP-2
  ('AR-3', 'Armoring 3', 'PCP-2', 'LV-Cable', 'armoring', 'running', 17.2, 18, 40, 85, 'Faisal Nasser'),
  ('XL-1', 'Extrusion Line 1', 'PCP-2', 'LV-Cable', 'extrusion', 'running', 120, 150, 185, 68, 'Yusuf Ibrahim'),
  ('XL-2', 'Extrusion Line 2', 'PCP-2', 'LV-Cable', 'extrusion', 'running', 145, 150, 190, 88, 'Tariq Saleh'),
  ('XT-1', 'Stranding XT-1', 'PCP-2', 'LV-Cable', 'stranding', 'running', 45, 50, 35, 80, 'Bandar Fahad'),
  ('XT-3', 'Stranding XT-3', 'PCP-2', 'LV-Cable', 'stranding', 'running', 48, 50, 36, 84, 'Majed Turki'),
  ('XT-6', 'Stranding XT-6', 'PCP-2', 'LV-Cable', 'stranding', 'idle', 0, 50, 25, 0, NULL),
  ('XT-7', 'Stranding XT-7', 'PCP-2', 'LV-Cable', 'stranding', 'running', 42, 50, 34, 76, 'Saud Abdullah'),
  ('XT-11', 'Stranding XT-11', 'PCP-2', 'LV-Cable', 'stranding', 'maintenance', 0, 50, 25, 0, NULL),
  ('REW-1', 'Rewinding 1', 'PCP-2', 'LV-Cable', 'rewinding', 'running', 200, 250, 30, 75, 'Omar Saeed'),
  ('REW-2', 'Rewinding 2', 'PCP-2', 'LV-Cable', 'rewinding', 'running', 230, 250, 32, 82, 'Nabil Hassan'),
  ('REW-10', 'Rewinding 10', 'PCP-2', 'LV-Cable', 'rewinding', 'running', 215, 250, 31, 78, 'Hussain Khalid'),
  ('MT-1', 'Testing MT-1', 'PCP-2', 'LV-Cable', 'testing', 'running', 100, 100, 25, 92, 'Ali Salman'),
  ('LX-3', 'Extrusion LX-3', 'PCP-2', 'LV-Cable', 'extrusion', 'running', 95, 120, 175, 72, 'Nawaf Sultan'),
  -- BSI CABLE SECTION - PCP-1
  ('DT-5', 'Drawing Unit 5', 'PCP-1', 'BSI-Cable', 'drawing', 'running', 29.8, 32, 44, 79, 'Shahid Iqbal'),
  ('DT-8', 'Drawing Unit 8', 'PCP-1', 'BSI-Cable', 'drawing', 'running', 31.5, 32, 42, 86, 'Essa Awaab'),
  ('DT-9', 'Drawing Unit 9', 'PCP-1', 'BSI-Cable', 'drawing', 'idle', 0, 32, 25, 0, NULL),
  ('PS-1', 'Processing PS-1', 'PCP-1', 'BSI-Cable', 'processing', 'running', 22, 25, 165, 74, 'Noshad Ahmed'),
  ('PS-2', 'Processing PS-2', 'PCP-1', 'BSI-Cable', 'processing', 'running', 24.5, 25, 170, 82, 'Abdul Qadir'),
  ('PS-3', 'Processing PS-3', 'PCP-1', 'BSI-Cable', 'processing', 'stopped', 0, 25, 25, 0, NULL),
  ('PS-4', 'Processing PS-4', 'PCP-1', 'BSI-Cable', 'processing', 'running', 23.8, 25, 168, 78, 'Kamal Saqr'),
  ('XT-9', 'Stranding XT-9', 'PCP-1', 'BSI-Cable', 'stranding', 'running', 44, 50, 36, 80, 'Salem Ahmad'),
  -- BSI CABLE SECTION - PCP-2
  ('XT-10', 'Stranding XT-10', 'PCP-2', 'BSI-Cable', 'stranding', 'running', 46, 50, 35, 83, 'Rashid Nasser'),
  ('XT-12', 'Stranding XT-12', 'PCP-2', 'BSI-Cable', 'stranding', 'running', 47, 50, 37, 81, 'Waleed Fahad'),
  ('JKT-4', 'Jacketing JKT-4', 'PCP-2', 'BSI-Cable', 'jacketing', 'running', 18, 20, 155, 81, 'Talal Al-Farmi'),
  ('XT-13', 'Stranding XT-13', 'PCP-2', 'BSI-Cable', 'stranding', 'idle', 0, 50, 25, 0, NULL),
  ('ARM-4', 'Armoring ARM-4', 'PCP-2', 'BSI-Cable', 'armoring', 'running', 16.2, 18, 41, 77, 'Hassan Mahmoud'),
  ('CAB-2', 'Cabling CAB-2', 'PCP-2', 'BSI-Cable', 'cabling', 'running', 35, 40, 38, 79, 'Yasser Omar'),
  ('CAB-4', 'Cabling CAB-4', 'PCP-2', 'BSI-Cable', 'cabling', 'running', 38, 40, 39, 85, 'Adel Khalid'),
  ('CAB-5', 'Cabling CAB-5', 'PCP-2', 'BSI-Cable', 'cabling', 'maintenance', 0, 40, 25, 0, NULL),
  ('TWI-1', 'Twisting TWI-1', 'PCP-2', 'BSI-Cable', 'twisting', 'running', 55, 60, 32, 76, 'Fares Abdullah'),
  ('TWI-2', 'Twisting TWI-2', 'PCP-2', 'BSI-Cable', 'twisting', 'running', 58, 60, 33, 82, 'Mazen Saeed'),
  ('REW-4', 'Rewinding 4', 'PCP-2', 'BSI-Cable', 'rewinding', 'running', 210, 250, 30, 77, 'Sami Turki'),
  ('REW-5', 'Rewinding 5', 'PCP-2', 'BSI-Cable', 'rewinding', 'running', 225, 250, 31, 80, 'Ibrahim Majed'),
  ('DTA', 'Drawing DTA', 'PCP-2', 'BSI-Cable', 'drawing', 'running', 30.5, 32, 43, 84, 'Khalid Mansour'),
  ('DTU', 'Drawing DTU', 'PCP-2', 'BSI-Cable', 'drawing', 'running', 29.2, 32, 44, 78, 'Nayef Sultan'),
  -- CV Line Area
  ('CV-1', 'CV Line 1', 'CV-Line', 'CV', 'cv-line', 'running', 8.5, 10, 320, 72, 'Fahad Nasser'),
  ('CV-2', 'CV Line 2', 'CV-Line', 'CV', 'cv-line', 'running', 9.2, 10, 315, 78, 'Abdulrahman Saleh'),
  -- Storage & Support
  ('SILO-1', 'Silo 1', 'Storage', 'Support', 'storage', 'running', 0, 0, 22, 95, NULL),
  ('SILO-2', 'Silo 2', 'Storage', 'Support', 'storage', 'running', 0, 0, 23, 90, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Insert New 55 Machines (from user's list)
-- ============================================================
INSERT INTO machines (id, name, type, status) VALUES
  ('CW2', 'Cold Welding 2', 'cold-welding', 'idle'),
  ('CW3', 'Cold Welding 3', 'cold-welding', 'idle'),
  ('CW4', 'Cold Welding 4', 'cold-welding', 'idle'),
  ('CW5', 'Cold Welding 5', 'cold-welding', 'idle'),
  ('CW6', 'Cold Welding 6', 'cold-welding', 'idle'),
  ('CW7', 'Cold Welding 7', 'cold-welding', 'idle'),
  ('IW5', 'Insulation Wrapping 5', 'insulation-wrapping', 'idle'),
  ('IW6', 'Insulation Wrapping 6', 'insulation-wrapping', 'idle'),
  ('BN10', 'Bunching 10', 'bunching', 'idle'),
  ('BN11', 'Bunching 11', 'bunching', 'idle'),
  ('BN12', 'Bunching 12', 'bunching', 'idle'),
  ('BN7', 'Bunching 7', 'bunching', 'idle'),
  ('BN8', 'Bunching 8', 'bunching', 'idle'),
  ('BN9', 'Bunching 9', 'bunching', 'idle'),
  ('CL3', 'Cabling 3', 'cabling', 'idle'),
  ('CL4', 'Cabling 4', 'cabling', 'idle'),
  ('CL5', 'Cabling 5', 'cabling', 'idle'),
  ('ST4', 'Stranding 4', 'stranding', 'idle'),
  ('ST5', 'Stranding 5', 'stranding', 'idle'),
  ('ST6', 'Stranding 6', 'stranding', 'idle'),
  ('TU1', 'Twisting Unit 1', 'twisting', 'idle'),
  ('XL4', 'Extrusion Line 4', 'extrusion', 'idle'),
  ('XT2', 'Stranding XT-2', 'stranding', 'idle'),
  ('XT4', 'Stranding XT-4', 'stranding', 'idle'),
  ('CV3', 'CV Line 3', 'cv-line', 'idle'),
  ('LX2', 'Extrusion LX-2', 'extrusion', 'idle'),
  ('DT6', 'Drawing Unit 6', 'drawing', 'idle'),
  ('DT7', 'Drawing Unit 7', 'drawing', 'idle'),
  ('SC2', 'Screening 2', 'screening', 'idle'),
  ('RW1', 'Rewinding RW-1', 'rewinding', 'idle'),
  ('RW2', 'Rewinding RW-2', 'rewinding', 'idle'),
  ('DT1', 'Drawing DT1', 'drawing', 'idle'),
  ('DT2', 'Drawing DT2', 'drawing', 'idle'),
  ('DT4', 'Drawing DT4', 'drawing', 'idle'),
  ('DT5', 'Drawing DT5', 'drawing', 'idle'),
  ('DT9', 'Drawing DT9', 'drawing', 'idle'),
  ('DT8', 'Drawing DT8', 'drawing', 'idle'),
  ('XT8', 'Stranding XT-8', 'stranding', 'idle'),
  ('PS1', 'Processing PS1', 'processing', 'idle'),
  ('PS2', 'Processing PS2', 'processing', 'idle'),
  ('PS3', 'Processing PS3', 'processing', 'idle'),
  ('PS4', 'Processing PS4', 'processing', 'idle'),
  ('XT1', 'Stranding XT1', 'stranding', 'idle'),
  ('XT10', 'Stranding XT10', 'stranding', 'idle'),
  ('XT12', 'Stranding XT12', 'stranding', 'idle'),
  ('XT9', 'Stranding XT9', 'stranding', 'idle'),
  ('XT11', 'Stranding XT11', 'stranding', 'idle'),
  ('XT13', 'Stranding XT13', 'stranding', 'idle'),
  ('XT3', 'Stranding XT3', 'stranding', 'idle'),
  ('XT6', 'Stranding XT6', 'stranding', 'idle'),
  ('XT7', 'Stranding XT7', 'stranding', 'idle'),
  ('AR3', 'Armoring AR3', 'armoring', 'idle'),
  ('BC1', 'Bunching BC1', 'bunching', 'idle'),
  ('BC2', 'Bunching BC2', 'bunching', 'idle'),
  ('XL1', 'Extrusion XL1', 'extrusion', 'idle'),
  ('XL2', 'Extrusion XL2', 'extrusion', 'idle'),
  ('AR2', 'Armoring AR2', 'armoring', 'idle'),
  ('CV1', 'CV Line CV1', 'cv-line', 'idle'),
  ('CV2', 'CV Line CV2', 'cv-line', 'idle')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Preventive Maintenance Checklist Tables
-- ============================================================

-- Checklist Templates: define equipment groups and items per machine
CREATE TABLE IF NOT EXISTS pm_checklist_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
  list_type TEXT NOT NULL CHECK (list_type IN ('mechanical', 'electrical')),
  equipment_no INTEGER NOT NULL,
  equipment_name TEXT NOT NULL,
  part_name TEXT NOT NULL,
  essential_care TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_template_machine ON pm_checklist_templates(machine_id);
CREATE INDEX IF NOT EXISTS idx_pm_template_type ON pm_checklist_templates(list_type);

-- Checklist Sessions: one record per PM event
CREATE TABLE IF NOT EXISTS pm_checklist_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
  order_no TEXT,
  notification_no TEXT,
  checklist_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prepared_by TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_session_machine ON pm_checklist_sessions(machine_id);
CREATE INDEX IF NOT EXISTS idx_pm_session_date ON pm_checklist_sessions(checklist_date);

-- Checklist Items: individual check results per session
CREATE TABLE IF NOT EXISTS pm_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES pm_checklist_sessions(id) ON DELETE CASCADE,
  template_id UUID REFERENCES pm_checklist_templates(id) ON DELETE SET NULL,
  list_type TEXT NOT NULL CHECK (list_type IN ('mechanical', 'electrical')),
  equipment_no INTEGER NOT NULL,
  equipment_name TEXT NOT NULL,
  part_name TEXT NOT NULL,
  essential_care TEXT NOT NULL,
  action_taken TEXT,
  spare_parts_used TEXT,
  remarks TEXT,
  priority TEXT DEFAULT '' CHECK (priority IN ('low', 'medium', 'high', 'critical', '')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_ok', 'needs_repair', 'replaced', 'under_observation')),
  checked_by TEXT,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_item_session ON pm_checklist_items(session_id);

-- RLS for new tables
ALTER TABLE pm_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_checklist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on pm_checklist_templates" ON pm_checklist_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pm_checklist_sessions" ON pm_checklist_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pm_checklist_items" ON pm_checklist_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. Employees Table (Workforce Management)
-- ============================================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('production', 'maintenance')),
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor', 'engineer', 'technician')),
  section TEXT,
  shift TEXT DEFAULT 'morning' CHECK (shift IN ('morning', 'evening', 'night')),
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  assigned_machine_id TEXT REFERENCES machines(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_machine ON employees(assigned_machine_id);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);

-- Seed employees
INSERT INTO employees (employee_id, name_en, name_ar, department, role, section, shift, status, assigned_machine_id) VALUES
  ('EMP001', 'Ahmed Ali', 'أحمد علي', 'production', 'operator', 'PCP-1', 'morning', 'active', 'DT-1'),
  ('EMP002', 'Mohammed Hassan', 'محمد حسن', 'production', 'operator', 'PCP-1', 'morning', 'active', 'DT-2'),
  ('EMP003', 'Khalid Omar', 'خالد عمر', 'production', 'operator', 'PCP-1', 'morning', 'active', 'BC-1'),
  ('EMP004', 'Saeed Ahmed', 'سعيد أحمد', 'production', 'operator', 'PCP-1', 'evening', 'active', 'AR-2'),
  ('EMP005', 'Faisal Nasser', 'فيصل ناصر', 'production', 'operator', 'PCP-2', 'morning', 'active', 'AR-3'),
  ('EMP006', 'Yusuf Ibrahim', 'يوسف إبراهيم', 'production', 'operator', 'PCP-2', 'morning', 'active', 'XL-1'),
  ('EMP007', 'Tariq Saleh', 'طارق صالح', 'production', 'operator', 'PCP-2', 'evening', 'active', 'XL-2'),
  ('EMP008', 'Bandar Fahad', 'بندر فهد', 'production', 'operator', 'PCP-2', 'morning', 'active', 'XT-1'),
  ('EMP009', 'Ali Supervisor', 'علي المشرف', 'production', 'supervisor', 'PCP-1', 'morning', 'active', NULL),
  ('EMP010', 'Nasser Supervisor', 'ناصر المشرف', 'production', 'supervisor', 'PCP-2', 'morning', 'active', NULL),
  ('EMP011', 'Ibrahim Tech', 'إبراهيم الفني', 'maintenance', 'technician', 'PCP-1', 'morning', 'active', NULL),
  ('EMP012', 'Salem Electrical', 'سالم الكهربائي', 'maintenance', 'technician', 'PCP-2', 'morning', 'active', NULL),
  ('EMP013', 'Fahad Engineer', 'فهد المهندس', 'maintenance', 'engineer', 'PCP-1', 'morning', 'active', NULL),
  ('EMP014', 'Majed Turki', 'ماجد التركي', 'production', 'operator', 'PCP-2', 'morning', 'active', 'XT-3'),
  ('EMP015', 'Hassan Maint Sup', 'حسن مشرف الصيانة', 'maintenance', 'supervisor', 'PCP-1', 'morning', 'active', NULL)
ON CONFLICT (employee_id) DO NOTHING;

-- ==========================================
-- 7. PM SCHEDULE CONFIG TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS pm_schedule_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT NOT NULL,
  pm_frequency TEXT NOT NULL CHECK (pm_frequency IN ('2month', '3month', '4month', '6month', 'annual')),
  start_month INT NOT NULL DEFAULT 1 CHECK (start_month BETWEEN 1 AND 12),
  pm_duration_weeks INT NOT NULL DEFAULT 1 CHECK (pm_duration_weeks BETWEEN 1 AND 4),
  year INT NOT NULL DEFAULT 2025,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, year)
);

CREATE INDEX IF NOT EXISTS idx_pm_schedule_config_machine ON pm_schedule_config(machine_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_config_year ON pm_schedule_config(year);

ALTER TABLE pm_schedule_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on pm_schedule_config" ON pm_schedule_config FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 8. PM SCHEDULE ENTRIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS pm_schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES pm_schedule_config(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  week INT NOT NULL CHECK (week BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'overdue', 'skipped')),
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, year, month, week)
);

CREATE INDEX IF NOT EXISTS idx_pm_schedule_entries_machine ON pm_schedule_entries(machine_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_entries_year ON pm_schedule_entries(year);

ALTER TABLE pm_schedule_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on pm_schedule_entries" ON pm_schedule_entries FOR ALL USING (true) WITH CHECK (true);

-- Seed PM schedule config from the PDF (2025 data)
INSERT INTO pm_schedule_config (machine_id, pm_frequency, start_month, pm_duration_weeks, year) VALUES
  -- 6x/year (every 2 months) machines
  ('CW4', '2month', 1, 1, 2025),
  ('CW5', '2month', 1, 1, 2025),
  ('CW6', '2month', 1, 1, 2025),
  ('CW7', '2month', 1, 1, 2025),
  ('IW6', '2month', 1, 1, 2025),
  ('DRW1', '2month', 1, 1, 2025),
  ('BC1', '2month', 1, 1, 2025),
  ('SCR2', '2month', 1, 1, 2025),
  ('DT1', '2month', 1, 1, 2025),
  ('DT4', '2month', 1, 1, 2025),
  ('DT2', '2month', 1, 1, 2025),
  ('DT3', '2month', 1, 1, 2025),
  ('AR2', '2month', 1, 1, 2025),
  ('ST4', '2month', 1, 1, 2025),
  ('DT7', '2month', 2, 1, 2025),
  ('DT8', '2month', 1, 1, 2025),
  ('DT9', '2month', 1, 1, 2025),
  ('DTA', '2month', 1, 1, 2025),
  ('DTU', '2month', 1, 1, 2025),
  ('ST6', '2month', 1, 1, 2025),
  ('ST5', '2month', 1, 1, 2025),
  ('XT4', '2month', 1, 1, 2025),
  ('XT3', '2month', 1, 1, 2025),
  ('XT6', '2month', 1, 1, 2025),
  ('XT8', '2month', 1, 1, 2025),
  ('XT9', '2month', 1, 1, 2025),
  ('XT10', '2month', 1, 1, 2025),
  ('XT11', '2month', 1, 1, 2025),
  ('CV2', '2month', 1, 1, 2025),
  ('CL4', '2month', 1, 1, 2025),
  ('CL1', '2month', 1, 1, 2025),
  -- 3x/year (every 4 months) or 8x/year machines
  ('CVX', '4month', 1, 2, 2025),
  ('CV3', '4month', 1, 2, 2025),
  -- 4x/year (every 3 months) machines
  ('XL1', '3month', 1, 2, 2025),
  ('TW11', '3month', 1, 2, 2025),
  ('TW12', '3month', 1, 2, 2025),
  ('TU1', '3month', 1, 2, 2025),
  ('XT2', '3month', 1, 2, 2025),
  ('CW3', '3month', 1, 2, 2025),
  ('PS1', '3month', 1, 2, 2025),
  ('XT12', '3month', 1, 2, 2025),
  ('XT1', '3month', 1, 2, 2025),
  ('LX2', '3month', 1, 2, 2025),
  ('PS7', '3month', 1, 2, 2025),
  ('BN7', '3month', 1, 2, 2025),
  ('BN10', '3month', 1, 2, 2025),
  ('LX3', '3month', 2, 2, 2025),
  -- 3x/year (every 4 months) machines
  ('AR3', '4month', 1, 2, 2025),
  ('CAR2', '4month', 1, 2, 2025),
  -- Semi-annual (every 6 months) machines
  ('RW3', '6month', 1, 2, 2025),
  ('RW1', '6month', 1, 2, 2025),
  ('RW2', '6month', 1, 2, 2025),
  ('CV1', '6month', 2, 2, 2025),
  ('RWT1', '6month', 1, 2, 2025),
  ('RW5', '6month', 1, 2, 2025),
  -- Annual machines
  ('XL4', 'annual', 3, 1, 2025),
  ('BC2', 'annual', 2, 1, 2025),
  ('XL2', 'annual', 6, 1, 2025)
ON CONFLICT (machine_id, year) DO NOTHING;
