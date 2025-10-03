# Elite AI Advisory

AI-powered business advisory platform providing intelligent analysis, recommendations, and business planning services.

## Features

- **Document Processing**: Upload and analyze PDFs, Word documents, and Excel files
- **AI-Powered Analysis**: Leverage OpenAI for intelligent business insights
- **Business Plan Generation**: Automated advisory and planning services
- **Multi-format Support**: Process various document types seamlessly
- **Secure Authentication**: Supabase-powered user management
- **Real-time Processing**: Fast document analysis and recommendations

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **AI**: OpenAI API
- **Deployment**: Vercel
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 16+
- npm 10+

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_OPENAI_API_KEY=your_openai_key
REACT_APP_SENTRY_DSN=your_sentry_dsn  # Optional: for error tracking
```

### Development

```bash
npm start
```

Runs on [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Project Structure

```
elite-ai-advisory/
├── src/
│   ├── components/    # React components
│   ├── services/      # API services
│   ├── stores/        # Zustand stores
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── public/            # Static assets
└── api/              # API endpoints
```

## Deployment

**Production:** [https://elite-ai-advisory-clean.vercel.app](https://elite-ai-advisory-clean.vercel.app)

### Automated Deployments
- **Main branch** → Auto-deploys to production
- **Pull Requests** → Auto-generates preview deployments
- **GitHub Actions** → Runs tests, linting, and type-checking

### Error Monitoring
Production errors are tracked in [Sentry](https://sentry.io) with:
- Real-time error alerts
- Session replay for debugging
- Performance monitoring
- User context tracking

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Push and create PR**
   ```bash
   git push -u origin feature/your-feature
   gh pr create
   ```

4. **Review preview deployment** (posted in PR comments)

5. **Merge to main** → Auto-deploys to production

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development guidelines and best practices.

## License

Private - All Rights Reserved
