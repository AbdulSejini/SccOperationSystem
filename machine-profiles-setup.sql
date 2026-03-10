-- ============================================================
-- Machine Dimension Assessments Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS machine_dimension_assessments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id    TEXT NOT NULL,
  dimension     TEXT NOT NULL CHECK (dimension IN ('maintenance', 'finance', 'production', 'hse', 'quality', 'it_sap')),
  score         FLOAT,
  data          JSONB DEFAULT '{}',
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'submitted', 'approved', 'rejected')),
  submitted_by  TEXT,
  submitted_at  TIMESTAMPTZ,
  approved_by   TEXT,
  approved_at   TIMESTAMPTZ,
  rejected_reason TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_mda_machine ON machine_dimension_assessments(machine_id);
CREATE INDEX IF NOT EXISTS idx_mda_status  ON machine_dimension_assessments(status);
CREATE INDEX IF NOT EXISTS idx_mda_dim     ON machine_dimension_assessments(dimension);

ALTER TABLE machine_dimension_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on machine_dimension_assessments"
  ON machine_dimension_assessments FOR ALL USING (true) WITH CHECK (true);
