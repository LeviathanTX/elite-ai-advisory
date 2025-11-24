# Bearable AI Advisors (AI-BoD)

AI-powered business advisory platform providing intelligent analysis, recommendations, and business planning services through virtual board members.

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
ai-bod/
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

**Production:** [https://ai-bod.vercel.app](https://ai-bod.vercel.app)
**Brand Name:** Bearable AI Advisors
**Domain:** bearableai.com

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

### Multi-Interface Vibe Coding

This project leverages our enhanced development architecture:

**Three Development Interfaces:**
- **Claude Code (Browser)**: Strategic planning, document review, architectural decisions
- **Claude Code (CLI)**: Implementation, file operations, git workflows, testing
- **Claude GitHub App**: Automated PR reviews, issue resolution, CI fixes

**Workflow:**
1. **Create feature branch** (via CLI or browser)
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Set up GitHub automation** (once per session)
   ```bash
   export GITHUB_TOKEN="your_github_pat_token"
   ```
   - Get token from: https://github.com/settings/tokens
   - Required scopes: `repo`, `workflow`, `write:packages`, `read:org`
   - Enables automated PR creation and merging via REST API

3. **Implement with Claude** (any interface)
   - Browser: Complex architecture, refactoring multi-file systems
   - CLI: Rapid implementation, debugging, file operations
   - GitHub: Review and iterate on PRs with `@claude` mentions

4. **Automated PR creation** (via GitHub REST API)
   ```bash
   git push -u origin feature/your-feature
   # Claude automatically creates PR using curl + GitHub API
   ```

5. **Review & verify**
   - Preview URL posted in PR comments
   - Browser console clean (verified)
   - Tests pass (automated CI)
   - `@claude please review this PR` for code review

6. **Merge to main** → Auto-deploys to production
   - Can be automated via REST API or manual via GitHub UI

**Project-Specific Agents:**
- See `.claude/agents/` for specialized subagents (document processing, business analysis, etc.)
- Agents share knowledge base via `.claude/CLAUDE.md`

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development guidelines and best practices.

## License

Private - All Rights Reserved
