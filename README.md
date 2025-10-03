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

Deployed on Vercel: [https://elite-ai-advisory.vercel.app](https://elite-ai-advisory.vercel.app)

## Contributing

See [CLAUDE.md](./CLAUDE.md) for development guidelines and best practices.

## License

Private - All Rights Reserved
