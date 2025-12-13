# DevOps Documentation for IndiaBorn

## Overview
This project uses GitHub Actions for CI/CD automation, Docker for containerization, and Render for deployment.

## CI/CD Pipeline

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Triggered on: Push to `main` or `develop`, Pull Requests to `main`
   - Jobs:
     - Backend Build & Test
     - Frontend Build & Test
     - Code Quality Analysis
     - Security Scanning
     - Deploy to Production (main branch only)
     - Notifications

2. **Docker Build & Push** (`.github/workflows/docker-build.yml`)
   - Triggered on: Push to `main`, Git tags
   - Builds and pushes Docker images to GitHub Container Registry
   - Supports semantic versioning tags

3. **Pull Request Checks** (`.github/workflows/pr-checks.yml`)
   - Triggered on: Pull Requests
   - Validates PR title format (conventional commits)
   - Runs quality checks
   - Auto-comments on PR with results

## Setup Instructions

### 1. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
```

To get your Render Deploy Hook:
1. Go to https://dashboard.render.com/
2. Select your IndiaBorn service
3. Go to Settings → Deploy Hook
4. Copy the deploy hook URL

### 2. Environment Variables (Render)

Set these on Render Dashboard → Environment:

```
Admin__Email=admin@indiaborn.com
Admin__Password=Devika@2501
Mongo__ConnectionString=mongodb+srv://indiaBorn_db_user:Devika%402501@indiaborn.ocqinn6.mongodb.net/
Mongo__DatabaseName=IndiabornDb
```

### 3. Branch Protection Rules

Go to Settings → Branches → Add rule for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - `Build & Test Backend`
  - `Build & Test Frontend`
  - `Code Quality Analysis`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

## Deployment Process

### Automatic Deployment (Recommended)

When you push to `main` branch:
1. GitHub Actions runs all tests
2. Builds backend and frontend
3. Runs security scans
4. Triggers Render deployment
5. Performs health check
6. Sends notification

### Manual Deployment

Option 1 - Via GitHub Actions:
```bash
# Go to Actions tab → CI/CD Pipeline → Run workflow
```

Option 2 - Via Render Dashboard:
```
Dashboard → IndiaBorn → Manual Deploy → Deploy latest commit
```

Option 3 - Via Git:
```bash
git push origin main
```

## Monitoring & Logs

### GitHub Actions
- View: Repository → Actions tab
- Shows: Build logs, test results, deployment status

### Render Logs
- View: https://dashboard.render.com/ → IndiaBorn → Logs
- Shows: Application logs, deployment logs, errors

### Application Monitoring
- Production URL: https://indiaborn.onrender.com/
- Health Check: https://indiaborn.onrender.com/api/products
- Admin Panel: https://indiaborn.onrender.com/admin

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feat/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feat/new-feature

# Create Pull Request on GitHub
```

### 2. Pull Request Review
- Automated checks run automatically
- Review code changes
- Address feedback
- Merge when approved and checks pass

### 3. Deployment
- Merge to `main` triggers automatic deployment
- Monitor deployment in GitHub Actions
- Verify deployment on production URL

## Rollback Procedure

### Option 1 - Revert via Git
```bash
# Find the commit to revert to
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

### Option 2 - Redeploy Previous Version (Render)
```
Render Dashboard → IndiaBorn → Manual Deploy → Select previous commit
```

## Troubleshooting

### Build Failures

**Backend Build Failed:**
```bash
# Check .NET version
dotnet --version

# Restore and build locally
cd Indiaborn.Api
dotnet restore
dotnet build
```

**Frontend Build Failed:**
```bash
# Check Node version
node --version

# Install and build locally
cd frontend
npm ci
npm run build
```

### Deployment Failures

**Check Render Logs:**
1. Go to Render Dashboard
2. Click on your service
3. View Logs tab
4. Look for error messages

**Common Issues:**
- Environment variables not set
- Database connection failure
- Port binding issues

### Health Check Failures

If deployment succeeds but health check fails:
1. Check if API is responding: `curl https://indiaborn.onrender.com/api/products`
2. Check database connectivity
3. Review application logs on Render

## Best Practices

### Commit Messages
Use conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding tests
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

Example: `feat: add product image upload feature`

### Pull Requests
- Keep PRs small and focused
- Write clear descriptions
- Link related issues
- Request reviews from team members
- Ensure all checks pass before merging

### Code Quality
- Run tests locally before pushing
- Fix linting errors
- Remove console.log statements
- Keep code formatted consistently

## Security

### Secrets Management
- Never commit secrets to Git
- Use GitHub Secrets for CI/CD
- Use Render Environment Variables for production
- Rotate secrets regularly

### Dependency Updates
```bash
# Backend
dotnet list package --outdated

# Frontend
cd frontend
npm outdated
```

Update regularly to fix security vulnerabilities.

## Performance Optimization

### Frontend
- Images optimized and compressed
- Bundle size monitored in build output
- Lazy loading for routes

### Backend
- Database indexes configured
- Connection pooling enabled
- Response caching where appropriate

### Infrastructure
- Render auto-scales based on load
- Static assets served via CDN-like delivery
- Database hosted on MongoDB Atlas (auto-scaling)

## Backup & Recovery

### Database Backups
MongoDB Atlas automatically backs up data:
- Point-in-time recovery available
- Snapshots retained for 7 days
- Manual snapshots can be created

### Code Repository
- Git provides version history
- All code backed up on GitHub
- Protected branches prevent force-pushes

## Support & Maintenance

### Regular Tasks
- **Weekly**: Review logs for errors
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **As needed**: Scale resources

### Contact Information
- GitHub Issues: Report bugs and request features
- Repository: https://github.com/rahulshinde095/IndiaBorn

## Metrics & KPIs

Monitor these metrics:
- Build success rate
- Deployment frequency
- Mean time to recovery (MTTR)
- Application uptime
- Response times
- Error rates

Access metrics via:
- GitHub Actions insights
- Render metrics dashboard
- MongoDB Atlas monitoring
