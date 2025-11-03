-- Manual migration to add plan enforcement columns to users table
-- Created: 2025-11-03
-- Reason: drizzle-kit push blocked by interactive prompt for agent_kpis unique constraint

-- Add plan column with free as default
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan VARCHAR DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise'));

-- Add plan expiration timestamp
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;

-- Add features override JSONB column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS features_override JSONB DEFAULT '{}'::jsonb;

-- Ensure all existing users have plan='free'
UPDATE users 
SET plan = 'free' 
WHERE plan IS NULL;

-- Verify the changes
SELECT COUNT(*) as total_users, 
       plan, 
       COUNT(*) as users_per_plan 
FROM users 
GROUP BY plan;
