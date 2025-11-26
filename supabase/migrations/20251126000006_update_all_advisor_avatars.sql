-- Update all celebrity advisor avatars with custom teddy bear images
-- This migration updates avatars for all 27 hardcoded advisors in AdvisorContext.tsx
-- Plus the 5 Shark Tank advisors already in the database

-- Images should be placed in public/images/advisors/

-- Note: Since most advisors are hardcoded in AdvisorContext.tsx and not in the database,
-- we need to update the hardcoded CELEBRITY_ADVISORS_BASE array to reference these avatar URLs.
-- This SQL file serves as documentation of the avatar mappings.

-- For advisors that DO exist in the celebrity_advisors table, update their avatar URLs:

-- Shark Tank Advisors (already in database via previous migrations)
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/mark-cuban.jpg' WHERE id = 'mark-cuban';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/barbara-corcoran.jpg' WHERE id = 'barbara-corcoran';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/daymond-john.jpg' WHERE id = 'daymond-john';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/lori-greiner.jpg' WHERE id = 'lori-greiner';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/robert-herjavec.jpg' WHERE id = 'robert-herjavec';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/kevin-oleary.jpg' WHERE id = 'kevin-oleary';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/kendra-scott.jpg' WHERE id = 'kendra-scott';
UPDATE celebrity_advisors SET avatar_url = '/images/advisors/daniel-lubetzky.jpg' WHERE id = 'daniel-lubetzky';

-- Avatar URL mappings for hardcoded advisors (for reference/documentation):
-- These advisors are defined in src/contexts/AdvisorContext.tsx and need to be updated there

-- TIER 1: Iconic Investors & Entrepreneurs
-- reid-hoffman -> /images/advisors/reid-hoffman.jpg
-- jason-calacanis -> /images/advisors/jason-calacanis.jpg
-- sheryl-sandberg -> /images/advisors/sheryl-sandberg.jpg

-- TIER 1: Strategic & Functional Advisors
-- chief-strategy-advisor (Dr. Michael Porter) -> /images/advisors/michael-porter.jpg
-- due-diligence-director (Sarah Chen) -> /images/advisors/sarah-chen.jpg
-- market-intelligence-advisor (David Kim) -> /images/advisors/david-kim.jpg
-- financial-architecture-advisor (Rebecca Goldman) -> /images/advisors/rebecca-goldman.jpg
-- operational-excellence-advisor (James Wilson) -> /images/advisors/james-wilson.jpg

-- TIER 2: Functional Specialists
-- technology-innovation-advisor (Dr. Fei-Fei Li) -> /images/advisors/fei-fei-li.jpg
-- human-capital-advisor (Adam Grant) -> /images/advisors/adam-grant.jpg
-- legal-regulatory-advisor (Judge Patricia Williams) -> /images/advisors/patricia-williams.jpg
-- esg-sustainability-advisor (Marc Benioff) -> /images/advisors/marc-benioff.jpg
-- customer-experience-advisor (Whitney Wolfe Herd) -> /images/advisors/whitney-wolfe-herd.jpg
-- supply-chain-advisor (Tim Cook) -> /images/advisors/tim-cook.jpg
-- data-analytics-advisor (DJ Patil) -> /images/advisors/dj-patil.jpg
-- international-expansion-advisor (Masayoshi Son) -> /images/advisors/masayoshi-son.jpg

-- TIER 3: Industry Specialists
-- technology-saas-specialist (Jensen Huang) -> /images/advisors/jensen-huang.jpg
-- healthcare-biotech-specialist (Dr. Jennifer Doudna) -> /images/advisors/jennifer-doudna.jpg
-- financial-services-specialist (Jamie Dimon) -> /images/advisors/jamie-dimon.jpg
-- manufacturing-industrial-specialist (Mary Barra) -> /images/advisors/mary-barra.jpg
-- consumer-retail-specialist (Satya Nadella) -> /images/advisors/satya-nadella.jpg
-- energy-sustainability-specialist (Elon Musk) -> /images/advisors/elon-musk.jpg
