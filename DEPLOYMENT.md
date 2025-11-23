# Deployment Guide for Vercel

This guide will help you deploy your Interactive Romantic Website to Vercel.

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. A Vercel account (free at [vercel.com](https://vercel.com))
3. Your Supabase project set up and configured

## Step 1: Prepare Your Code

### 1.1 Remove Unnecessary Files
- ✅ Firebase files have been removed
- ✅ Unused documentation files cleaned up

### 1.2 Verify Environment Variables
Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your-actual-supabase-url
VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

**⚠️ IMPORTANT:** Never commit your `.env` file to Git! It's already in `.gitignore`.

## Step 2: Push to GitHub

1. Initialize Git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Interactive Romantic Website"
   ```

2. Create a new repository on GitHub:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., "interactive-romantic-website")
   - Don't initialize with README
   - Click "Create repository"

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign in to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - Vercel should auto-detect Vite and configure everything automatically
   - If you see configuration options, they should be:
     - **Framework Preset:** Vite
     - **Root Directory:** `./`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - If you don't see these options, that's fine - Vercel auto-detected them correctly

4. **Add Environment Variables (IMPORTANT):**
   - **Before clicking Deploy**, look for "Environment Variables" section
   - If you don't see it on the import screen, you can add them after deployment:
     - Go to your project dashboard after deployment
     - Click "Settings" → "Environment Variables"
     - Add:
       - **Name:** `VITE_SUPABASE_URL`
       - **Value:** Your Supabase project URL
       - **Environment:** Select "Production", "Preview", and "Development" (or just "Production" for now)
       - Click "Save"
     - Add second variable:
       - **Name:** `VITE_SUPABASE_ANON_KEY`
       - **Value:** Your Supabase anon key
       - **Environment:** Select "Production", "Preview", and "Development" (or just "Production" for now)
       - Click "Save"
   - After adding environment variables, you'll need to redeploy (Vercel will prompt you)

5. **Deploy:**
   - Click "Deploy" (or if you already deployed, add environment variables and redeploy)
   - Wait for the build to complete (usually 1-2 minutes)

6. **Your site is live!** 🎉
   - Vercel will provide you with a URL like: `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Step 4: Pre-Production Environments

Vercel automatically creates multiple environments for your project:

### Environment Types

1. **Production Environment:**
   - Deployed from your `main` or `master` branch
   - URL: `https://your-project.vercel.app`
   - This is your live site

2. **Preview Environments:**
   - Automatically created for:
     - Pull requests
     - Other branches (not main/master)
   - URL: `https://your-project-git-branch-name.vercel.app`
   - Perfect for testing changes before merging to production

3. **Development Environment:**
   - For local development
   - Run `vercel dev` locally

### Setting Up Environment Variables for Each Environment

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. When adding/editing variables, select which environments they apply to:
   - **Production:** For your live site
   - **Preview:** For pull requests and branch deployments
   - **Development:** For local development

**Recommended Setup:**
- Add your Supabase credentials to **all three environments** (Production, Preview, Development)
- This allows you to test changes in preview environments before they go to production
- You can use the same Supabase project or create separate ones for testing

### Creating a Pre-Production Branch

To test changes in a pre-production environment:

1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

3. Vercel automatically creates a preview deployment
4. Test the preview URL before merging to main
5. When ready, merge to main to deploy to production

## Step 5: Update Environment Variables (If Needed)

If you need to update environment variables after deployment:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Update the values
4. Select which environments to apply to (Production, Preview, Development)
5. Redeploy (or wait for automatic redeploy on next push)

## Step 6: Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variable names start with `VITE_` (required for Vite)
- Redeploy after adding/updating variables
- Check that variables are set for the correct environment (Production, Preview, Development)

### Site Works Locally But Not on Vercel
- Verify Supabase RLS (Row Level Security) policies allow public access
- Check browser console for errors
- Verify Supabase URL and key are correct

## Security Checklist

✅ **Environment Variables:**
- `.env` is in `.gitignore` (never commit secrets)
- Using `VITE_` prefix for client-side variables
- Supabase anon key is safe to expose (it's designed for client-side use)

✅ **Supabase Security:**
- RLS policies are configured correctly
- Storage policies allow public read access
- No sensitive data exposed in client code

✅ **Code Security:**
- No hardcoded API keys or secrets
- All sensitive data uses environment variables
- Input validation in place

## Post-Deployment

1. **Test Your Site:**
   - Visit your Vercel URL
   - Test all interactive features
   - Verify database connections work

2. **Monitor:**
   - Check Vercel dashboard for build status
   - Monitor Supabase dashboard for API usage
   - Check browser console for errors

3. **Update:**
   - Push changes to GitHub
   - Vercel will automatically redeploy
   - Or manually trigger redeploy from dashboard

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check build logs in Vercel dashboard for specific errors

