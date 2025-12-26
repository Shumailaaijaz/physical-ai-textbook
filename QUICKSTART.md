# Quick Start Guide

Get the Physical AI Textbook platform running in minutes.

## For Students & Learners

**Access the live site**: https://shumailaaijaz.github.io/physical-ai-textbook/

No setup required! The textbook is fully available online.

---

## For Developers

### Frontend Development

**Prerequisites:**
- Node.js 20+
- Git

**Setup:**

```bash
# Clone repository
git clone https://github.com/Shumailaaijaz/physical-ai-textbook.git
cd physical-ai-textbook

# Install dependencies
npm install

# Start development server
npm start
```

Visit: http://localhost:3000

**Available Commands:**

```bash
npm start          # Start dev server
npm run build      # Build for production
npm run serve      # Preview production build
npm run typecheck  # Type checking
npm run clear      # Clear cache
```

### Backend Development

**Prerequisites:**
- Node.js 20+
- Git

**Setup:**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit: http://localhost:3001

**API Endpoints:**
- Health: http://localhost:3001/health
- Detailed Health: http://localhost:3001/health/detailed
- Chapters API: http://localhost:3001/api/v1/chapters

---

## Deployment

### Frontend (GitHub Pages)

**Automatic deployment on push to main:**

```bash
# Make changes
git add .
git commit -m "Your message"
git push origin main
```

GitHub Actions will automatically deploy to:
https://shumailaaijaz.github.io/physical-ai-textbook/

### Backend (Railway)

**Quick deploy:**

```bash
cd server

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Backend (Render)

1. Go to https://dashboard.render.com/
2. Connect GitHub repository
3. Create Web Service
4. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Environment variables from `.env.example`
5. Deploy

---

## Project Structure

```
website/
├── docs/                    # Textbook chapters (MDX)
├── blog/                    # Blog posts
├── src/                     # React components
│   ├── components/          # Reusable components
│   ├── css/                 # Global styles
│   └── pages/               # Page components
├── static/                  # Static assets
│   └── img/                 # Images
├── server/                  # Backend API
│   ├── src/                 # TypeScript source
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
│   └── dist/                # Compiled JavaScript
├── .github/                 # GitHub Actions
│   └── workflows/           # CI/CD workflows
├── docusaurus.config.ts     # Docusaurus config
├── sidebars.ts              # Sidebar navigation
└── package.json             # Dependencies
```

---

## Common Tasks

### Add a New Chapter

1. Create file: `docs/XX-chapter-name.mdx`
2. Add frontmatter:
   ```mdx
   ---
   id: XX-chapter-name
   title: Chapter Title
   sidebar_label: Chapter Title
   sidebar_position: XX
   ---
   ```
3. Write content using MDX
4. Update `sidebars.ts` if needed
5. Commit and push

### Update Styling

1. Edit `src/css/custom.css` for global styles
2. Edit component CSS modules: `src/components/ComponentName/styles.module.css`
3. Test locally: `npm start`
4. Build and verify: `npm run build && npm run serve`

### Add API Endpoint

1. Edit `server/src/routes/api.ts`
2. Add route handler:
   ```typescript
   router.get('/endpoint', (req, res) => {
     res.json({ data: 'response' });
   });
   ```
3. Test locally: `npm run dev`
4. Deploy to Railway/Render

---

## Troubleshooting

### Frontend Issues

**Build fails:**
```bash
npm run clear
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port 3000 in use:**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**TypeScript errors:**
```bash
npm run typecheck
```

### Backend Issues

**Port 3001 in use:**
```bash
# Change PORT in .env file
PORT=3002
```

**Health check fails:**
```bash
# Check if server is running
curl http://localhost:3001/health

# Check logs
npm run dev
```

**Environment variables not loading:**
```bash
# Ensure .env file exists
cp .env.example .env

# Verify dotenv is installed
npm list dotenv
```

---

## Next Steps

1. **Read the docs**: DEPLOYMENT.md for full deployment guide
2. **Launch checklist**: LAUNCH_CHECKLIST.md for production
3. **Contributing**: See CONTRIBUTING.md (if it exists)
4. **Issues**: https://github.com/Shumailaaijaz/physical-ai-textbook/issues

---

## Resources

- **Docusaurus Docs**: https://docusaurus.io/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Express.js Docs**: https://expressjs.com

---

**Need Help?**

- GitHub Issues: https://github.com/Shumailaaijaz/physical-ai-textbook/issues
- Discussions: https://github.com/Shumailaaijaz/physical-ai-textbook/discussions

---

**Version**: 1.0.0
**Last Updated**: 2025-12-06
