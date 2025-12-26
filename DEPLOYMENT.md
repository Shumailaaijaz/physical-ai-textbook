# Production Deployment Guide

This guide covers the complete deployment process for the Physical AI Textbook platform, including both frontend (Docusaurus) and backend (API server).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Frontend Deployment (GitHub Pages)](#frontend-deployment-github-pages)
- [Backend Deployment](#backend-deployment)
  - [Railway Deployment](#railway-deployment)
  - [Render Deployment](#render-deployment)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Launch Checklist](#launch-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Users (Browser)                    │
└──────────────┬──────────────────────────────┘
               │
               ├─────────────────┬────────────────────┐
               ▼                 ▼                    ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │  GitHub Pages    │  │   Railway    │  │    Render    │
    │  (Frontend)      │  │  (Backend)   │  │  (Backend)   │
    │                  │  │              │  │              │
    │  Docusaurus      │  │  Express API │  │  Express API │
    │  Static Site     │  │  + Health    │  │  + Health    │
    └──────────────────┘  └──────────────┘  └──────────────┘
```

**Components:**
- **Frontend**: Docusaurus static site hosted on GitHub Pages
- **Backend**: Node.js/Express API with health checks
- **Deployment Options**: Railway or Render for backend hosting

---

## Prerequisites

Before deploying, ensure you have:

- [x] GitHub account with repository access
- [x] Railway or Render account (for backend)
- [x] Node.js 20+ installed locally
- [x] Git installed and configured
- [x] Environment variables configured
- [x] Domain name (optional, for custom domain)

---

## Frontend Deployment (GitHub Pages)

### Automatic Deployment

The frontend is automatically deployed via GitHub Actions when you push to the `main` branch.

**Workflow triggers:**
- Push to `main` branch
- Changes to `docs/`, `src/`, `blog/`, `static/`, or config files
- Manual workflow dispatch

### Manual Deployment

If you need to deploy manually:

```bash
# 1. Build the site
npm run build

# 2. Test the build locally
npm run serve

# 3. Deploy to GitHub Pages
npm run deploy
```

### Configuration Steps

1. **Enable GitHub Pages:**
   - Go to repository **Settings → Pages**
   - Source: **GitHub Actions**
   - Save changes

2. **Verify Deployment:**
   - Check **Actions** tab for workflow status
   - Wait for deployment to complete (~2-3 minutes)
   - Visit: `https://shumailaaijaz.github.io/physical-ai-textbook/`

3. **Custom Domain (Optional):**
   - Add CNAME file: `echo "your-domain.com" > static/CNAME`
   - Configure DNS: Add CNAME record pointing to `shumailaaijaz.github.io`
   - Update `docusaurus.config.ts`: Set `url` to your domain

---

## Backend Deployment

Choose either Railway or Render for backend deployment.

### Railway Deployment

**Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

**Step 2: Initialize Project**
```bash
cd server
railway init
```

**Step 3: Configure Environment Variables**

In Railway dashboard:
- Go to your project → Variables
- Add environment variables:
  ```
  NODE_ENV=production
  PORT=3001
  FRONTEND_URL=https://shumailaaijaz.github.io
  LOG_LEVEL=info
  ```

**Step 4: Deploy**
```bash
# Push to Railway
railway up

# Or link to GitHub repository for auto-deploy
railway link
```

**Step 5: Get Deployment URL**
```bash
railway domain
```

**Health Check:**
```bash
curl https://your-app.railway.app/health
```

### Render Deployment

**Step 1: Create Web Service**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `physical-ai-api`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

**Step 2: Configure Environment Variables**

In Render dashboard → Environment:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://shumailaaijaz.github.io
LOG_LEVEL=info
```

**Step 3: Deploy**
- Render auto-deploys from `main` branch
- Monitor deployment in dashboard

**Step 4: Verify Deployment**
```bash
curl https://your-app.onrender.com/health
```

### Using Docker (Alternative)

If you prefer Docker deployment:

```bash
# Build Docker image
cd server
docker build -t physical-ai-api .

# Run locally
docker run -p 3001:3001 --env-file .env physical-ai-api

# Push to registry
docker tag physical-ai-api:latest registry/physical-ai-api:latest
docker push registry/physical-ai-api:latest
```

---

## Environment Variables

### Frontend (.env)

Create `.env` in root directory:

```env
# API Configuration
REACT_APP_API_URL=https://your-api-url.railway.app

# Analytics (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PROGRESS_TRACKING=false

# Build
NODE_ENV=production
```

### Backend (server/.env)

Create `server/.env`:

```env
# Server
NODE_ENV=production
PORT=3001

# CORS
FRONTEND_URL=https://shumailaaijaz.github.io

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Security Notes:**
- NEVER commit `.env` files to git
- Use platform-specific secret management (Railway/Render environment variables)
- Rotate secrets regularly
- Use different values for staging/production

---

## Health Checks

The backend provides multiple health check endpoints:

### Endpoints

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `GET /health` | Basic health | Quick liveness check |
| `GET /health/detailed` | System metrics | Detailed monitoring |
| `GET /health/live` | Liveness probe | Kubernetes/Docker |
| `GET /health/ready` | Readiness probe | Load balancer |

### Example Health Check Response

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

### Monitoring Setup

**Railway:**
- Go to project → Observability
- Configure health check path: `/health`
- Set check interval: 30s

**Render:**
- Health checks are auto-configured from `render.yaml`
- Path: `/health`
- Monitor in dashboard

---

## Launch Checklist

Use this checklist before going to production:

### Pre-Deployment

#### Frontend
- [ ] All chapters reviewed and proofread
- [ ] Links tested (internal and external)
- [ ] Images optimized and loading correctly
- [ ] Meta tags and SEO configured
- [ ] Social media preview images set
- [ ] 404 page exists and styled
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] Analytics configured (if using)

#### Backend
- [ ] All API endpoints tested
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] Logging set up
- [ ] Health checks responding
- [ ] Environment variables set
- [ ] Security headers configured (Helmet)
- [ ] Input validation implemented
- [ ] API documentation written

#### Infrastructure
- [ ] GitHub Pages enabled
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS certificates verified
- [ ] Backend deployment platform chosen (Railway/Render)
- [ ] Environment variables configured in platform
- [ ] Database configured (if needed)
- [ ] Backup strategy defined
- [ ] Monitoring alerts set up

### Deployment

#### Frontend Deployment
1. [ ] Run `npm run build` locally to verify build succeeds
2. [ ] Check build output size (should be < 10MB)
3. [ ] Test production build locally: `npm run serve`
4. [ ] Push to `main` branch
5. [ ] Monitor GitHub Actions workflow
6. [ ] Verify deployment in Actions tab
7. [ ] Wait for deployment to complete (~2-3 min)
8. [ ] Test live site: `https://shumailaaijaz.github.io/physical-ai-textbook/`

#### Backend Deployment
1. [ ] Review environment variables
2. [ ] Run build locally: `cd server && npm run build`
3. [ ] Test locally: `npm run dev`
4. [ ] Deploy to Railway/Render
5. [ ] Monitor deployment logs
6. [ ] Verify health endpoint: `/health`
7. [ ] Test API endpoints
8. [ ] Check CORS configuration

### Post-Deployment

#### Verification
- [ ] Homepage loads correctly
- [ ] All chapters accessible
- [ ] Navigation works (sidebar, breadcrumbs)
- [ ] Search functionality works
- [ ] API endpoints responding
- [ ] Health checks passing
- [ ] No console errors
- [ ] No broken links (use link checker)
- [ ] Mobile version works
- [ ] Forms work (if any)
- [ ] External links open correctly

#### Performance
- [ ] Page load time < 3s
- [ ] Time to Interactive < 5s
- [ ] First Contentful Paint < 2s
- [ ] Cumulative Layout Shift < 0.1
- [ ] API response time < 500ms
- [ ] Images lazy-loading correctly
- [ ] CDN configured (if using)

#### SEO & Analytics
- [ ] Google Search Console configured
- [ ] Sitemap submitted
- [ ] robots.txt configured
- [ ] Analytics tracking (if enabled)
- [ ] Social media cards working
- [ ] OpenGraph tags correct

#### Monitoring
- [ ] Health checks monitored
- [ ] Error tracking configured
- [ ] Uptime monitoring set up (UptimeRobot, Pingdom)
- [ ] Log aggregation configured
- [ ] Alerts configured for downtime
- [ ] Performance monitoring active

### Documentation
- [ ] Deployment docs updated
- [ ] API documentation published
- [ ] Contributing guidelines updated
- [ ] README.md complete
- [ ] Changelog maintained
- [ ] Release notes written

---

## Monitoring & Maintenance

### Monitoring Tools

**Free Options:**
- **UptimeRobot**: Monitor uptime and response time
- **Google Search Console**: SEO and indexing issues
- **Google Analytics**: Traffic and user behavior (if enabled)
- **Railway/Render Dashboard**: Resource usage and logs

### Regular Maintenance Tasks

**Weekly:**
- Review deployment logs
- Check health check metrics
- Monitor API response times
- Review error logs

**Monthly:**
- Update dependencies (`npm outdated`)
- Review security advisories
- Check SSL certificate expiry
- Review resource usage
- Analyze traffic patterns

**Quarterly:**
- Dependency security audit (`npm audit`)
- Performance optimization review
- Backup verification
- Disaster recovery test
- Cost review

### Metrics to Monitor

| Metric | Target | Alert If |
|--------|--------|----------|
| Uptime | 99.9% | < 99.5% |
| Response time (API) | < 500ms | > 1000ms |
| Page load time | < 3s | > 5s |
| Error rate | < 0.1% | > 1% |
| Memory usage | < 75% | > 90% |
| CPU usage | < 60% | > 80% |

---

## Rollback Procedures

If deployment fails or issues arise in production:

### Frontend Rollback

**Option 1: Revert Git Commit**
```bash
# Identify problematic commit
git log

# Revert to previous commit
git revert <commit-hash>
git push origin main
```

**Option 2: Redeploy Previous Version**
```bash
# Checkout previous tag/commit
git checkout <previous-tag>

# Trigger manual deployment
# GitHub Actions will deploy this version
```

### Backend Rollback

**Railway:**
```bash
# View deployments
railway status

# Rollback to previous deployment
railway rollback
```

**Render:**
- Go to dashboard → Deploys
- Click on previous successful deployment
- Click "Redeploy"

### Emergency Rollback Checklist

1. [ ] Identify issue and scope
2. [ ] Document error messages and logs
3. [ ] Notify team/users (if applicable)
4. [ ] Execute rollback
5. [ ] Verify rollback successful
6. [ ] Test critical functionality
7. [ ] Monitor error rates
8. [ ] Create incident report
9. [ ] Fix issue in development
10. [ ] Plan redeployment

### Communication Template

When issues occur:

```markdown
## Incident Report

**Date**: [YYYY-MM-DD HH:MM UTC]
**Severity**: [Critical/High/Medium/Low]
**Status**: [Investigating/Identified/Monitoring/Resolved]

**Impact**:
- Affected services: [Frontend/Backend/Both]
- User impact: [Description]

**Timeline**:
- [HH:MM] Issue detected
- [HH:MM] Root cause identified
- [HH:MM] Rollback initiated
- [HH:MM] Service restored

**Root Cause**: [Description]

**Resolution**: [What was done]

**Prevention**: [Steps to prevent recurrence]
```

---

## Support & Troubleshooting

### Common Issues

**Frontend not loading:**
1. Check GitHub Pages is enabled
2. Verify workflow completed successfully
3. Check browser console for errors
4. Clear cache and reload

**API not responding:**
1. Check health endpoint: `/health`
2. Verify environment variables
3. Check platform logs (Railway/Render)
4. Verify CORS configuration

**Build failures:**
1. Run `npm run build` locally
2. Check for TypeScript errors
3. Verify Node.js version (20+)
4. Clear cache: `npm run clear`

### Getting Help

- **GitHub Issues**: https://github.com/Shumailaaijaz/physical-ai-textbook/issues
- **Discussions**: https://github.com/Shumailaaijaz/physical-ai-textbook/discussions
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

---

## Next Steps

After successful deployment:

1. **Monitor**: Set up monitoring and alerts
2. **Optimize**: Review performance metrics and optimize
3. **Document**: Keep this guide updated
4. **Iterate**: Gather feedback and improve
5. **Scale**: Plan for growth and scaling needs

---

**Last Updated**: 2025-12-06
**Version**: 1.0.0
