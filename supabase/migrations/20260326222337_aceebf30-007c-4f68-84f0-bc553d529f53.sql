
-- Add plant_head and security_guard roles to enum
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'plant_head';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'security_guard';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
