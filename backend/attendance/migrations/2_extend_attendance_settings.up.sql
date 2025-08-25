-- Safely extend attendance_settings with additional columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='attendance_settings' AND column_name='working_days_per_week'
  ) THEN
    ALTER TABLE attendance_settings
      ADD COLUMN working_days_per_week INT DEFAULT 5,
      ADD COLUMN weekend_days TEXT[] DEFAULT ARRAY['Saturday','Sunday'],
      ADD COLUMN holiday_dates DATE[] DEFAULT '{}',
      ADD COLUMN overtime_enabled BOOLEAN DEFAULT false,
      ADD COLUMN overtime_rate FLOAT DEFAULT 0.0,
      ADD COLUMN break_duration_minutes INT DEFAULT 60;
  END IF;
END $$;

-- Ensure default row exists
INSERT INTO attendance_settings (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM attendance_settings WHERE id = 1);

