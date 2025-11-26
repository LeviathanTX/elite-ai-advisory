-- Update celebrity advisor avatars with custom teddy bear images
-- These images should be placed in public/images/advisors/

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/mark-cuban.jpg'
WHERE id = 'mark-cuban';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/daniel-lubetzky.jpg'
WHERE id = 'daniel-lubetzky';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/lori-greiner.jpg'
WHERE id = 'lori-greiner';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/kevin-oleary.jpg'
WHERE id = 'kevin-oleary';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/kendra-scott.jpg'
WHERE id = 'kendra-scott';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/daymond-john.jpg'
WHERE id = 'daymond-john';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/robert-herjavec.jpg'
WHERE id = 'robert-herjavec';

UPDATE celebrity_advisors
SET avatar_url = '/images/advisors/barbara-corcoran.jpg'
WHERE id = 'barbara-corcoran';
