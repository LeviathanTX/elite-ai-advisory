# Advisor Avatar Images

This directory contains the custom teddy bear avatar images for the Shark Tank celebrity advisors.

## Required Images

Place the following image files in this directory with these exact names:

1. **mark-cuban.jpg** - Teddy bear in Dallas Mavericks jersey (#41)
2. **daniel-lubetzky.jpg** - Teddy bear in navy suit with light blue shirt
3. **lori-greiner.jpg** - Teddy bear with blonde hair, blue dress, and pearls
4. **kevin-oleary.jpg** - Teddy bear in black pinstripe suit with red tie
5. **kendra-scott.jpg** - Teddy bear with blonde hair, pink blazer, and jewelry
6. **daymond-john.jpg** - Teddy bear in gray pinstripe suit with patterned tie
7. **robert-herjavec.jpg** - Teddy bear with dark hair, gray pinstripe suit, blue tie
8. **barbara-corcoran.jpg** - Teddy bear with dark hair, gray pinstripe suit, blue tie

## Image Specifications

- **Format**: JPG (recommended) or PNG
- **Recommended size**: 400x400px to 800x800px
- **Aspect ratio**: 1:1 (square)
- **File size**: Keep under 200KB for optimal loading performance

## After Adding Images

1. Run the database migration: `supabase db push`
2. Deploy to production: `vercel --prod`
3. Clear browser cache to see updated avatars

The images will be automatically loaded by the AdvisorContext when displaying celebrity advisors.
