# Security Guide

## Authentication Security

This application uses environment variables to store login credentials securely. **Never commit your `.env` file to Git!**

## Setup Instructions

1. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual credentials:**
   ```env
   VITE_USER1_USERNAME=your_username
   VITE_USER1_PASSWORD=your_secure_password
   VITE_USER1_NAME=Your Name
   
   VITE_USER2_USERNAME=partner_username
   VITE_USER2_PASSWORD=partner_secure_password
   VITE_USER2_NAME=Partner Name
   ```

3. **Verify `.env` is in `.gitignore`** (it should be already)

4. **Never commit `.env` to Git!**

## Security Best Practices

### ⚠️ Important Notes:

1. **Environment Variables are Client-Side:**
   - Variables prefixed with `VITE_` are exposed to the browser
   - This means anyone can view them in the browser's developer tools
   - This is acceptable for a private couple's website, but not for public applications

2. **For Production/Public Apps:**
   - Use a proper authentication service (Supabase Auth, Firebase Auth, etc.)
   - Never store passwords in client-side code
   - Use server-side authentication with hashed passwords

3. **Current Implementation:**
   - Credentials are stored in environment variables (not hardcoded)
   - `.env` file is gitignored (won't be committed)
   - Suitable for a private, personal website

## If You Accidentally Committed Credentials

If you accidentally pushed credentials to Git:

1. **Immediately change your passwords** in the `.env` file
2. **Remove credentials from Git history** (if it's a public repo, consider it compromised)
3. **Use `git filter-branch` or BFG Repo-Cleaner** to remove sensitive data from history
4. **Force push** (only if you're sure, and warn collaborators)

## Deployment

When deploying to Vercel or other platforms:

1. Add environment variables in your hosting platform's dashboard
2. Set the same variables (VITE_USER1_USERNAME, etc.) in the platform settings
3. Never commit `.env` files

## Questions?

For a private couple's website, the current setup is acceptable. For anything public or production-grade, consider implementing proper authentication with Supabase Auth or similar services.

