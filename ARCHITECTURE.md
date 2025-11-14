# Elite AI Advisory - Architecture Documentation

## Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **TanStack Query** - Data fetching and caching

### Backend Services
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication and authorization
  - Real-time subscriptions
  - Row-level security
- **OpenAI API** - AI-powered analysis and recommendations

### Document Processing
- **PDF** - Extract and analyze business plans
- **Word (.docx)** - Process document submissions
- **Excel (.xlsx)** - Financial data analysis

## Key Features

### Document Analysis Pipeline
1. Multi-format file upload (PDF, Word, Excel)
2. Text extraction and parsing
3. AI-powered content analysis
4. Business insights generation
5. Structured recommendations output

### AI Advisory Services
- Business plan analysis and feedback
- Financial projection review
- Market analysis and positioning
- Competitive landscape assessment
- Strategic recommendations

### Data Persistence
- User profiles and preferences
- Document upload history
- Analysis results and reports
- Advisory session transcripts

## Development Commands

### Local Development
```bash
npm start              # Start dev server (port 3000)
npm run build          # Production build
npm run verify         # Run all checks (lint, type-check, test)
```

### Testing
```bash
npm test               # Run test suite with coverage
npm run type-check     # TypeScript compilation check
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix linting issues
```

### Custom Commands (Claude CLI)
```bash
claude /test-loop      # Automated test fixing loop
claude /verify-pr      # Comprehensive PR verification
```

## Deployment

### Platform: Vercel

#### Manual Deployment
```bash
vercel --prod --force
```

#### Deployment Checklist
1. Push code to git repository
2. Verify Vercel deployment triggered
3. Check deployment logs for errors
4. Wait for bundle hash to change
5. Test live URL with actual user flows
6. Verify browser console shows no errors

#### Environment Variables (Vercel)
Required environment variables:
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REACT_APP_OPENAI_API_KEY` - OpenAI API key

### Auto-Deploy Configuration
- May not be configured for all branches
- Check Vercel dashboard for branch settings
- Use manual deployment if auto-deploy fails

## Project Structure

```
ai-bod/
├── public/               # Static assets
│   ├── avatars/         # Advisor profile images
│   └── pdf.worker.min.js # PDF.js worker
├── src/
│   ├── components/      # React components
│   │   ├── Advisory/    # Advisor management
│   │   ├── Audio/       # Real-time audio features
│   │   ├── Auth/        # Authentication
│   │   ├── Conversations/ # Chat interfaces
│   │   ├── Documents/   # Document handling
│   │   ├── Help/        # User guidance
│   │   └── Modes/       # Business analysis modes
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Business logic
│   │   ├── aiService.ts         # OpenAI integration
│   │   ├── supabase.ts          # Supabase client
│   │   ├── DocumentProcessor.ts # Multi-format parsing
│   │   └── advisorAI.ts         # Advisory logic
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions
├── api/                 # Serverless functions
└── package.json
```

## Common Development Scenarios

### Adding a New Document Type
1. Update `DocumentProcessor.ts` with parser
2. Add file type validation
3. Update upload UI to accept new format
4. Add tests for new format parsing
5. Update TypeScript types

### Adding a New AI Analysis Mode
1. Create component in `src/components/Modes/`
2. Add mode to navigation/routing
3. Implement AI prompt engineering
4. Add result visualization
5. Update tests

### Debugging Deployment Issues
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API endpoints with curl/Postman
4. Check browser console on live site
5. Compare local build with deployed bundle

## Performance Considerations

### Document Processing
- Large PDFs may require chunking
- Use web workers for heavy parsing
- Implement progress indicators
- Cache parsed results

### AI API Calls
- Implement request queuing
- Add retry logic with exponential backoff
- Show loading states
- Cache common responses

### State Management
- Keep Zustand stores focused and minimal
- Use TanStack Query for server state
- Implement optimistic updates
- Clear stale data appropriately

## Security Best Practices

### API Keys
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Implement rate limiting

### User Data
- Respect user privacy
- Implement proper authentication
- Use Supabase RLS (Row Level Security)
- Sanitize user inputs
- Encrypt sensitive data

### Document Handling
- Validate file types and sizes
- Scan for malicious content
- Implement proper access controls
- Clean up temporary files

## Troubleshooting

### Common Issues

**"Cannot find module" errors**
- Run `npm install` to restore dependencies
- Check for missing package in package.json
- Verify node_modules exists

**Type errors**
- Check tsconfig.json configuration
- Ensure imports are correct
- Run `npm run type-check` for details

**Tests timing out**
- Look for infinite loops
- Check for uncaught promises
- Increase timeout in test config

**Lint failures**
- Run `npm run lint:fix` for auto-fixes
- Manually address remaining issues
- Check .eslintrc for rules

**Deployment fails**
- Verify all tests pass locally
- Check Vercel logs for specific errors
- Ensure environment variables are set
- Try manual deployment with --force flag
