# Vercel Deployment Guide - AASML Backend

This guide will help you deploy the AASML backend to Vercel.

## Prerequisites

- Vercel Account (free at https://vercel.com)
- Backend code pushed to GitHub
- Environment variables ready

## Step-by-Step Deployment

### 1. Push to GitHub (if not already done)

```bash
cd backend
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

Visit https://vercel.com and:
1. Click "Add New" → "Project"
2. Select your GitHub repository
3. Import the project

### 3. Configure Environment Variables

In Vercel Dashboard, go to Project Settings → Environment Variables and add:

| Variable Name | Value | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://sayed:12345@cluster1.bmyln.mongodb.net/aasml-db?retryWrites=true&w=majority&appName=Cluster1` | Your MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | `dx2ycr2jl` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `274643448823674` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `i5CY8jPo92inWO4elads77eE4q8` | Cloudinary API secret |
| `CLOUDINARY_URL` | `cloudinary://274643448823674:i5CY8jPo92inWO4elads77eE4q8@dx2ycr2jl` | Cloudinary URL |
| `JWT_SECRET` | `aasml_super_secret_key_2024_change_in_production` | JWT secret key |
| `JWT_EXPIRE` | `7d` | JWT expiration time |
| `NODE_ENV` | `production` | Environment type |
| `FRONTEND_URL` | `https://aasml.vercel.app` | Your Vercel frontend URL |
| `PORT` | `3001` | Server port (optional) |

**⚠️ Security Tips:**
- Change `JWT_SECRET` to something more secure in production
- Store sensitive keys securely
- Consider using MongoDB Atlas environment-specific credentials

### 4. Configure Root Directory (if needed)

If your backend is in a subdirectory:
1. Go to Project Settings
2. Set "Root Directory" to `backend`

### 5. Deploy

Click "Deploy" button. Vercel will:
1. Build the project (run `npm run build`)
2. Install dependencies
3. Deploy to production

### 6. Get Your Backend URL

After deployment, you'll get a URL like:
```
https://your-backend-name.vercel.app
```

Update your frontend environment to use this URL in API calls.

## Configuration Files Included

### `vercel.json`
- Specifies Node.js runtime
- Routes all requests to Express app
- Sets environment variables

### `.vercelignore`
- Excludes unnecessary files from deployment

### Updated `server.ts`
- Graceful shutdown handling for serverless
- Exported app for serverless function
- SIGTERM signal handling

## Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aasml.org","password":"admin123456"}'

# Get research
curl https://your-backend.vercel.app/api/research
```

## Troubleshooting

### Build Fails
- Check Node version compatibility
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally

### Runtime Errors
- Check Vercel logs: Project → Deployments → click deployment → Logs
- Verify environment variables are set
- Check database connectivity

### CORS Issues
- Verify `FRONTEND_URL` is in allowed origins in `app.ts`
- Check frontend is making requests to correct backend URL

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes Vercel IPs (allow 0.0.0.0/0 for simplicity, restrict later)
- Check connection string in environment variables
- Ensure MongoDB database exists

## Production Checklist

- [ ] All environment variables configured
- [ ] JWT_SECRET changed to secure value
- [ ] CORS origins updated for production
- [ ] Database backups enabled
- [ ] Logging/monitoring configured
- [ ] Error handling tested
- [ ] API rate limiting configured
- [ ] Database indexes created
- [ ] Cloudinary API credentials verified

## Update Frontend API Base URL

In `frontend/src/lib/axios.ts`, update:

```typescript
const API_BASE_URL = 'https://your-backend.vercel.app/api';
```

Or use environment variables:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Redeploy

Any push to main branch will trigger automatic redeployment.

To manually redeploy:
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click "Redeploy" on latest deployment

## Support

For more info:
- Vercel Docs: https://vercel.com/docs
- Node.js on Vercel: https://vercel.com/docs/nodejs
