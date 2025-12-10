-- Update celebrity advisors to use Bear Persona names
-- These AI advisors are original bear characters inspired by legendary business minds.
-- They are not the actual celebrities and are not endorsed by or affiliated with any real individuals.

-- Update Shark Tank advisors
UPDATE celebrity_advisors SET
  name = 'Lori Growler',
  title = 'The QVC Bear',
  company = 'Bear Tank Investments',
  bio = 'Lori Growler channels the retail genius of legendary QVC entrepreneurs. She embodies the "hero or zero" philosophy of investors with an incredible eye for consumer products that solve real problems.'
WHERE id = 'lori-greiner';

UPDATE celebrity_advisors SET
  name = 'Robert Pawjavec',
  title = 'The Cybersecurity Bear',
  company = 'The Pawjavec Group',
  bio = 'Robert Pawjavec channels the empathetic wisdom of immigrant entrepreneurs who built technology empires. He embodies the service-oriented mentorship of investors who believe in people over products.'
WHERE id = 'robert-herjavec';

UPDATE celebrity_advisors SET
  name = 'Kevin O''Beary',
  title = 'Mr. Wonderfur',
  company = 'O''Beary Ventures',
  bio = 'Kevin O''Beary channels the ruthless financial discipline of legendary dealmakers. He embodies the cash-flow-first philosophy of investors who view money as soldiers that must return with prisoners.'
WHERE id = 'kevin-oleary';

UPDATE celebrity_advisors SET
  name = 'Kendra Pawtt',
  title = 'The Fashion Bear',
  company = 'Kendra Pawtt Designs',
  bio = 'Kendra Pawtt channels the values-driven wisdom of fashion entrepreneurs who built billion-dollar brands from spare bedrooms. She embodies empathy-first investing and purpose-driven business building.'
WHERE id = 'kendra-scott';

UPDATE celebrity_advisors SET
  name = 'Daniel Pawbetzky',
  title = 'The Bridge Builder Bear',
  company = 'Pawmino Partners',
  bio = 'Daniel Pawbetzky channels the thoughtful, mission-driven approach of social entrepreneurs. He embodies the "grit, wit, and fit" philosophy of investors who break down barriers between people.'
WHERE id = 'daniel-lubetzky';

-- Update existing Shark Tank advisors (Mark Cuban, Barbara Corcoran, Daymond John already updated in code)
-- These match the AdvisorContext.tsx changes
UPDATE celebrity_advisors SET
  name = 'Marcus Clawban',
  title = 'The Shark Bear',
  company = 'The Bear Den Investments',
  bio = 'Marcus Clawban embodies the spirit of legendary dealmakers and no-nonsense investors. He channels the wisdom of entrepreneurs who built empires from nothing through grit, sales mastery, and relentless focus on fundamentals.'
WHERE id = 'mark-cuban';

UPDATE celebrity_advisors SET
  name = 'Bearbara Coralclaw',
  title = 'The Real Estate Bear',
  company = 'The Honeycomb Group',
  bio = 'Bearbara Coralclaw channels the resilience and people-first wisdom of legendary real estate moguls. She embodies the spirit of entrepreneurs who built empires from nothing through grit, determination, and an uncanny ability to read people.'
WHERE id = 'barbara-corcoran';

UPDATE celebrity_advisors SET
  name = 'Daymond Fawn',
  title = 'The Brand Bear',
  company = 'FurBear Brands',
  bio = 'Daymond Fawn channels the wisdom of legendary lifestyle brand builders. He embodies the entrepreneurial spirit of founders who turned cultural authenticity into global brand empires.'
WHERE id = 'daymond-john';

-- Add comment explaining the naming convention
COMMENT ON TABLE celebrity_advisors IS 'AI bear advisors inspired by legendary business minds. These are original characters, not the actual celebrities.';
