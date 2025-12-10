-- Update celebrity advisors to use Bear Persona names
-- These AI advisors are original bear characters inspired by legendary business minds.
-- They are not the actual celebrities and are not endorsed by or affiliated with any real individuals.

-- Delete advisors that are being removed from the roster
DELETE FROM celebrity_advisors WHERE id IN (
  'lori-greiner',
  'robert-herjavec',
  'kevin-oleary',
  'kendra-scott',
  'daniel-lubetzky',
  'mark-cuban',
  'barbara-corcoran'
);

-- Update remaining Shark Tank advisor (Daymond John)
UPDATE celebrity_advisors SET
  name = 'Daymond Fawn',
  title = 'The Brand Bear',
  company = 'FurBear Brands',
  bio = 'Daymond Fawn channels the wisdom of legendary lifestyle brand builders. He embodies the entrepreneurial spirit of founders who turned cultural authenticity into global brand empires.'
WHERE id = 'daymond-john';

-- Add comment explaining the naming convention
COMMENT ON TABLE celebrity_advisors IS 'AI bear advisors inspired by legendary business minds. These are original characters, not the actual celebrities.';
