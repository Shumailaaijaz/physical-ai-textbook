# Physical AI Textbook API Server

Backend API server for the Physical AI & Humanoid Robotics textbook platform.

## Features

- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe development
- **Health Checks** - Multiple endpoints for monitoring
- **Security** - Helmet, CORS, rate limiting
- **Logging** - Winston with structured logging
- **Compression** - Gzip compression for responses
- **Production Ready** - Configured for Railway/Render deployment

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Checks

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /health` | Basic health check | `{ status: "healthy" }` |
| `GET /health/detailed` | Detailed system metrics | Memory, CPU, uptime |
| `GET /health/live` | Liveness probe | `{ status: "alive" }` |
| `GET /health/ready` | Readiness probe | `{ status: "ready" }` |

### API v1

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chapters` | GET | List all textbook chapters |
| `/api/v1/progress` | POST | Update user progress |

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://shumailaaijaz.github.io
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

See `railway.json` for configuration.

### Render

1. Connect GitHub repository
2. Configure as Web Service
3. Set environment variables
4. Deploy automatically from main branch

See `render.yaml` for configuration.

### Docker

```bash
# Build image
docker build -t physical-ai-api .

# Run container
docker run -p 3001:3001 --env-file .env physical-ai-api
```

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Main application entry
│   ├── routes/
│   │   ├── health.ts         # Health check endpoints
│   │   └── api.ts            # API endpoints
│   └── utils/
│       └── logger.ts         # Winston logger configuration
├── dist/                     # Compiled JavaScript (generated)
├── logs/                     # Log files (generated)
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
├── railway.json             # Railway deployment config
├── render.yaml              # Render deployment config
└── tsconfig.json            # TypeScript configuration
```

## Monitoring

### Health Check Example

```bash
# Basic health
curl https://your-api.railway.app/health

# Detailed health
curl https://your-api.railway.app/health/detailed
```

### Response Example

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "memory": {
      "status": "healthy",
      "used": 128,
      "total": 512,
      "percentage": 25
    },
    "cpu": {
      "status": "healthy",
      "usage": 15
    }
  }
}
```

## Security

- **Helmet**: Security headers
- **CORS**: Configured for frontend domain
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request validation middleware
- **Environment Variables**: Secrets management

## Performance

- **Compression**: Gzip enabled
- **Response Time**: Target <500ms
- **Memory Usage**: Target <75%
- **CPU Usage**: Target <60%

## Logging

Winston logger with structured logging:

- **Development**: Colored console output
- **Production**: JSON format, file rotation
- **Levels**: error, warn, info, debug

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run typecheck`
5. Test locally: `npm run dev`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/Shumailaaijaz/physical-ai-textbook/issues
- **Discussions**: https://github.com/Shumailaaijaz/physical-ai-textbook/discussions
- **Documentation**: See DEPLOYMENT.md in root directory

---

**Version**: 1.0.0
**Last Updated**: 2025-12-06
