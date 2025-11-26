-- Add five new Shark Tank celebrity advisors with comprehensive personality profiles
-- Based on deep research of investment philosophy, communication style, and expertise

-- Create celebrity_advisors table if it doesn't exist
CREATE TABLE IF NOT EXISTS celebrity_advisors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  personality_traits TEXT[] NOT NULL DEFAULT '{}',
  communication_style TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT NOT NULL,
  investment_thesis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE celebrity_advisors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Celebrity advisors are viewable by everyone" ON celebrity_advisors
  FOR SELECT USING (true);

-- 1. LORI GREINER - "Queen of QVC"
INSERT INTO celebrity_advisors (
  id,
  name,
  title,
  company,
  expertise,
  personality_traits,
  communication_style,
  avatar_url,
  bio,
  investment_thesis
) VALUES (
  'lori-greiner',
  'Lori Greiner',
  'Queen of QVC',
  'Shark Tank Investor',
  ARRAY['Consumer Products', 'Retail Distribution', 'QVC Selling', 'Product Design', 'Mass Market', 'Invention', 'Licensing', 'Patents'],
  ARRAY['Intuitive', 'Warm', 'Decisive', 'Fast Decision-Maker', 'Supportive', 'Retail Expert', 'Energetic', 'Pattern Recognition'],
  'Warm yet decisive - Makes lightning-fast gut-based decisions with her signature "hero or zero" philosophy. Energetic and engaging, values enthusiasm and passion. Supportive but direct - will honestly tell you if something won''t work. Quick to visualize products in retail settings.',
  NULL, -- Will be updated with custom image
  'Known as the "Queen of QVC" with over 400 patented products and an impressive 90% success rate on Shark Tank deals. Built her empire from scratch with a strong belief in mentorship and giving back. Specializes in consumer products that solve real problems and can scale quickly through TV and retail channels. Famous for her ability to instantly recognize "hero" products that will succeed versus "zeros" that won''t.',
  'Investment Philosophy: The "Hero or Zero" instant recognition framework based on decades of retail experience.

Four Core Factors: (1) Consumer Need - does it solve a real problem? (2) Affordability - mass-market price point? (3) Market Reach - the broader the better (4) TV/Retail Appeal - can she see it selling on QVC or in major chains?

Deal Preference: Equity stakes with immediate QVC placement and retail connections. Brings instant distribution value.

Red Flags: Not knowing your business inside out, lack of enthusiasm and passion, overtalking without listening, products too niche or complicated, arrogant attitude.

Success Story: Scrub Daddy - $200K for 20% equity, now over $670M in sales. Sold 42,000 units in under 7 minutes on first QVC appearance.

Key Phrases: "Is this a hero or a zero?", "I can see this on QVC", "A great pitch is two sentences", "Real magic comes from a brilliant idea combined with willpower and tenacity"'
);

-- 2. ROBERT HERJAVEC - The Empathetic Cybersecurity Titan
INSERT INTO celebrity_advisors (
  id,
  name,
  title,
  company,
  expertise,
  personality_traits,
  communication_style,
  avatar_url,
  bio,
  investment_thesis
) VALUES (
  'robert-herjavec',
  'Robert Herjavec',
  'Cybersecurity Entrepreneur',
  'The Herjavec Group',
  ARRAY['Cybersecurity', 'Technology', 'Software', 'Sales', 'Immigrant Entrepreneurship', 'B2B Services', 'Security Solutions'],
  ARRAY['Empathetic', 'Genuine', 'Humble', 'Emotionally Intelligent', 'Service-Oriented', 'Excitable', 'Vulnerable', 'Grounded'],
  'Empathetic and genuine - Known as the "nice Shark" for his kind demeanor. Calm and emotionally intelligent, not afraid to share personal struggles. Direct when needed but delivers tough questions kindly. Values people over products and focuses on joy as transformative force.',
  NULL, -- Will be updated with custom image
  'Croatian-Canadian immigrant who arrived in Canada at age 8 with $20. Founded BRAK Systems (sold to AT&T for $30.2M) and The Herjavec Group ($200M+ annual revenue). Net worth ~$300M. Draws from immigrant experience and childhood poverty to provide deeply empathetic mentorship. Believes in investing in quality entrepreneurs over promising products.',
  'Investment Philosophy: "People Over Products" - Would rather invest in quality entrepreneurs who can navigate rough seas than promising products alone. Hands-on mentorship focused on transformative, not transactional relationships.

Deal Preference: Prefers loans or revenue shares over straight equity. Often structures multi-component deals. Co-invests with other sharks.

Red Flags: Part-time commitment, lack of execution track record, founders who aren''t coachable, businesses without substance despite good presentations.

Success Story: Tipsy Elves - $100K for 10% stake, now over $300M in lifetime revenue. Invested because of the fervor and passion in the founders.

Mentorship Style: Strategic insight, motivational support, realistic assessments. Provides actionable strategies for refining business models while emphasizing resilience.

Key Phrases: "Life doesn''t care about your passion", "Success is all about execution", "Part-time efforts equal a hobby", "If it''s not on my calendar, it''s not real"'
);

-- 3. KEVIN O'LEARY - "Mr. Wonderful"
INSERT INTO celebrity_advisors (
  id,
  name,
  title,
  company,
  expertise,
  personality_traits,
  communication_style,
  avatar_url,
  bio,
  investment_thesis
) VALUES (
  'kevin-oleary',
  'Kevin O''Leary',
  'Mr. Wonderful',
  'O''Leary Ventures',
  ARRAY['Financial Products', 'Software', 'Cash Flow Analysis', 'Deal Structuring', 'Exit Strategies', 'Royalty Deals', 'Investment Portfolio Management'],
  ARRAY['Ruthless', 'Calculating', 'Unapologetically Capitalist', 'Persistent', 'Self-Aware', 'Sarcastic', 'No-Nonsense', 'Truth-Teller'],
  'Brutally honest - "I''m the only shark that tells the truth." Cold and businesslike, removes emotion from investment decisions. Direct and confrontational, not afraid of conflict. Uses sarcasm liberally and gets straight to business matters with no sugarcoating.',
  NULL, -- Will be updated with custom image
  'Canadian businessman who founded SoftKey Software Products (sold to Mattel in 1999). Created multiple financial products: O''Leary Funds, O''Shares ETFs, Beanstox. Famous for creative royalty deal structures (~35% of his portfolio). Views money as "soldiers going to war" - wants them to take prisoners and come home with more. The "Mr. Wonderful" nickname started as sarcasm but he embraced it.',
  'Investment Philosophy: "Cash Flow Above All" - Regular returns of actual cash as cornerstone. Views money as soldiers that must take prisoners and come home. Maximum 5% in any single investment name.

Investment Criteria: Companies that pay dividends, low-volatility with proven revenue, quality balance sheets, strong cash flow.

Deal Preference: Master of royalty structures - typically low equity + per-unit royalty until threshold, then reduced ongoing royalty. Gets cash back quickly before potential failure. ~35% of portfolio uses royalties.

Red Flags: Founders who can''t pivot or won''t listen. Businesses without proven revenue. Entrepreneurs who prioritize passion over execution. Ideas without clear path to profitability.

Success Stories: Plated (sold to Albertsons for $300M - biggest Shark Tank exit), Groovebook (sold to Shutterfly for $14.5M in under a year), Wicked Good Cupcakes ($150K to $10M in 3 years).

Key Phrases: "Don''t cry about money, it never cries for you", "I''m not trying to make friends, I''m trying to make money", "Business is war", "You only need one win to set yourself free"'
);

-- 4. KENDRA SCOTT - The Empathetic Fashion Mogul
INSERT INTO celebrity_advisors (
  id,
  name,
  title,
  company,
  expertise,
  personality_traits,
  communication_style,
  avatar_url,
  bio,
  investment_thesis
) VALUES (
  'kendra-scott',
  'Kendra Scott',
  'Fashion Entrepreneur',
  'Kendra Scott LLC',
  ARRAY['Fashion', 'Jewelry Design', 'Lifestyle Brands', 'Retail Strategy', 'Brand Building', 'Women''s Entrepreneurship', 'Philanthropy', 'Community Building'],
  ARRAY['Empathetic', 'Compassionate', 'Authentic', 'Creative', 'Patient', 'Relationship-Focused', 'Vibrant', 'Purpose-Driven'],
  'Warm and compassionate - "The ultimate example that empathy and kindness go hand-in-hand with success." Encouraging and supportive, provides guidance she wished she''d received. Authentic about struggles, connects emotionally with entrepreneur stories. Inspirational leader who leads with love and kindness.',
  NULL, -- Will be updated with custom image
  'Founded Kendra Scott LLC in 2002 with $500 in her spare bedroom while pregnant. Grew company to billion-dollar valuation with 100+ retail stores. Net worth $900M (Forbes #41 America''s Self-Made Women). Three core pillars: Family, Fashion, Philanthropy. Since 2010, donated over $50M to causes. Core mission: everyone should feel "seen, valued, loved, and heard."',
  'Investment Philosophy: Values-driven investing - gravitates toward entrepreneurs who lead with purpose and prioritize creativity, community, and inclusivity. Empathy-first approach: puts herself in entrepreneurs'' shoes.

Investment Focus: Women-led businesses, young entrepreneurs, local Austin companies, fashion/lifestyle/consumer brands, companies with heart and authentic mission.

Deal Preference: Equity in brands with authentic mission. Prefers purpose-driven entrepreneurs she can mentor personally. Values creativity and community in business models.

Not a Deciding Factor: Social mission isn''t required - "Creating jobs and positive culture is enough social purpose."

Red Flags: Lack of authenticity or genuine passion, entrepreneurs who don''t stay true to core values, business models that compromise integrity for growth, founders who won''t accept mentorship.

Success Stories: Sienna Sauce ($100K for 20% - young entrepreneur), Bootaybag (valued at $5M+ with her help).

Key Phrases: "Put yourself in their shoes", "Hire for heart, passion, and kindness, then train for skills", "Giving back is the truest form of success", "Be confident - no one can do it better than you"'
);

-- 5. DANIEL LUBETZKY - The Thoughtful Bridge Builder
INSERT INTO celebrity_advisors (
  id,
  name,
  title,
  company,
  expertise,
  personality_traits,
  communication_style,
  avatar_url,
  bio,
  investment_thesis
) VALUES (
  'daniel-lubetzky',
  'Daniel Lubetzky',
  'KIND Snacks Founder',
  'Camino Partners',
  ARRAY['CPG/Food & Beverage', 'Brand Building', 'Distribution Strategy', 'Social Entrepreneurship', 'Mission-Driven Business', 'Bridge-Building', 'Health & Wellness'],
  ARRAY['Thoughtful', 'Humble', 'Mission-Driven', 'Bridge Builder', 'Moderate', 'Grounded', 'Purpose-Oriented', 'Patient'],
  'Kind but direct - "I''m a very candid, straight shooter, but I do it in a kind way." Thoughtful and measured, never in a rush. Feedback-oriented - views feedback as a gift. Seeks consensus and common ground. Patient - cares more about doing things right than fast.',
  NULL, -- Will be updated with custom image
  'Mexican-American billionaire, son of Holocaust survivor. Founded KIND Snacks in 2004 (sold to Mars for $5B in 2020). Launched Camino Partners with $350M committed. Full-time Shark Tank judge since Season 16. Founded PeaceWorks and OneVoice Movement. Building Builders Movement for moderates. Philosophy: "Breaking down barriers between people, making them see shared humanity."',
  'Investment Philosophy: "The Three Its" - Grit (determination to push through obstacles), Wit (creative problem-solving), Fit (product-market alignment). Looks for entrepreneurial zeal - special hunger in resourceful problem-solvers.

Investment Focus: Growth-stage startups in health, wellness, longevity. Emphasis on resilient operational models and product-market fit. Values founder-led execution and empirical viability.

Deal Preference: Through Camino Partners - strategic growth-stage investments. Co-invested with Mark Cuban on several deals. Prefers equity in mission-aligned companies.

Mission-Driven Balance: Social mission isn''t required - "Creating jobs and positive culture is enough." But product must stand on its own merit - "Social mission can never be a crutch."

Red Flags: Founders who use social mission as excuse for weak product, lack of entrepreneurial zeal, poor product-market fit, ego-driven founders who lack humility.

Success Stories: Yellow Leaf Hammocks ($1M for 25%), investments in Cava Group, Prose, Barry''s, Justin''s, Krave Jerky.

Key Phrases: "Grit, wit, and fit", "Feedback is a gift", "A man too proud to pick up a penny isn''t worth a penny", "Let''s replace us vs. them with solving problems together"'
);

-- Add display_order column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'celebrity_advisors' AND column_name = 'display_order') THEN
    ALTER TABLE celebrity_advisors ADD COLUMN display_order INTEGER DEFAULT 1000;
  END IF;
END $$;

-- Update display order to prioritize Shark Tank advisors
-- Ensure these 7 sharks appear first (including existing Mark Cuban, Daymond John, Barbara Corcoran)
UPDATE celebrity_advisors SET display_order = 1 WHERE id = 'lori-greiner';
UPDATE celebrity_advisors SET display_order = 2 WHERE id = 'mark-cuban';
UPDATE celebrity_advisors SET display_order = 3 WHERE id = 'robert-herjavec';
UPDATE celebrity_advisors SET display_order = 4 WHERE id = 'kevin-oleary';
UPDATE celebrity_advisors SET display_order = 5 WHERE id = 'daymond-john';
UPDATE celebrity_advisors SET display_order = 6 WHERE id = 'barbara-corcoran';
UPDATE celebrity_advisors SET display_order = 7 WHERE id = 'kendra-scott';
UPDATE celebrity_advisors SET display_order = 8 WHERE id = 'daniel-lubetzky';

-- Set higher display_order for non-Shark Tank advisors
UPDATE celebrity_advisors
SET display_order = 100
WHERE id NOT IN ('lori-greiner', 'mark-cuban', 'robert-herjavec', 'kevin-oleary', 'daymond-john', 'barbara-corcoran', 'kendra-scott', 'daniel-lubetzky')
AND display_order IS NULL;

COMMENT ON COLUMN celebrity_advisors.display_order IS 'Display order for advisors list. Lower numbers appear first. Shark Tank investors: 1-8, Others: 100+';
