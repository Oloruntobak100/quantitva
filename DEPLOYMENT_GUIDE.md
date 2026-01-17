# Deployment Guide: GitHub & Vercel

This guide will help you deploy your Market Intelligence Platform to Vercel with full authentication and user management functionality.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase project (sign up at https://supabase.com)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and create

### 1.2 Run SQL Setup

1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `supabase-auth-setup.sql`
3. Click "Run" to execute the SQL
4. This will:
   - Create the users table with role-based access control
   - Set up authentication triggers
   - Configure Row Level Security (RLS) policies
   - Ensure email uniqueness

### 1.3 Create First Admin User

After signing up your first user through the app, promote them to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Run this in the Supabase SQL Editor.

### 1.4 Get Supabase Credentials

From your Supabase project dashboard:

1. Go to Settings → API
2. Copy these values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - ⚠️ Keep this secret!

## Step 2: GitHub Setup

### 2.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with user management"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2.2 Important Files for Deployment

Make sure these files are committed:
- `package.json` - Dependencies
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- All application code

### 2.3 Create .gitignore

Ensure `.gitignore` includes:

```
node_modules/
.next/
.env.local
.env
.DS_Store
*.log
.vercel
```

## Step 3: Vercel Deployment

### 3.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables

Before deploying, add these environment variables in Vercel:

**Project Settings → Environment Variables**

#### Required Environment Variables:

```env
# Supabase Configuration (from Step 1.4)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser (public)
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (never expose to browser)
- All three variables are **required**
- Add them to **all environments** (Production, Preview, Development)

### 3.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Visit your deployment URL

### 3.4 Verify Deployment

Test these features:
1. ✅ Sign up new user
2. ✅ Login
3. ✅ View dashboard
4. ✅ Logout
5. ✅ Profile update (in top-right dropdown)

## Step 4: Admin User Setup

### 4.1 Create Your Admin Account

1. Sign up through your deployed app
2. Go back to Supabase SQL Editor
3. Run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

4. Log out and log back in
5. You should now see the "Users" menu in the dashboard

### 4.2 Admin Features

As an admin, you can:
- View all users (Dashboard → Users)
- Create new users
- Edit user details (name, email, company, role)
- Delete users (except yourself)
- Promote users to admin
- View user statistics

## Step 5: Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will:
- Automatically detect the push
- Build your application
- Deploy to production
- Keep your environment variables

## Environment Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Yes | Supabase anonymous key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ✅ Yes | Supabase service role key for server-side operations |

## Common Issues & Solutions

### Issue: "Failed to fetch users"

**Solution:** Check that `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables.

### Issue: "Cannot read properties of null (user)"

**Solution:** 
1. Clear browser cache and cookies
2. Log out and log back in
3. Check that authentication is properly configured in Supabase

### Issue: Email already exists error on signup

**Solution:** This is expected behavior. Use the "Login" page if you already have an account.

### Issue: "Forbidden" error when accessing Users page

**Solution:** Your account needs admin role. Run the SQL command in Step 4.1.

### Issue: Environment variables not working

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure all three variables are set for all environments
3. Redeploy: Deployments → Latest → "..." → "Redeploy"

## Security Best Practices

### ✅ DO:
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use strong passwords (minimum 6 characters)
- Regularly review user access in the Users page
- Keep your dependencies updated: `npm update`

### ❌ DON'T:
- Never commit `.env.local` to Git
- Don't share service role keys in public channels
- Don't use weak passwords for admin accounts
- Don't give admin access to untrusted users

## Updating Your Deployment

### Code Updates

```bash
# Pull latest changes (if working in a team)
git pull origin main

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

### Database Schema Updates

If you need to update the database schema:

1. Create a new SQL migration file
2. Run it in Supabase SQL Editor
3. Test in Supabase before deploying code changes
4. Deploy code changes to Vercel

### Environment Variable Updates

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit or add variables
3. Redeploy for changes to take effect

## Production Checklist

Before going live:

- [ ] Supabase project created and SQL setup complete
- [ ] First admin user created and tested
- [ ] All environment variables configured in Vercel
- [ ] Sign up/Login/Logout tested
- [ ] User management (admin) tested
- [ ] Role-based access control verified
- [ ] Custom domain configured (optional)
- [ ] Email notifications configured (optional)
- [ ] Backup strategy in place for Supabase data

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployments
- View build logs
- Check runtime logs
- View analytics

### Supabase Dashboard
- Monitor database usage
- View authentication logs
- Check API usage
- Manage users (as backup)

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

## Quick Command Reference

```bash
# Local development
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:3000)

# Deployment
git add .
git commit -m "message"
git push origin main    # Auto-deploys to Vercel

# Database
# Run SQL in Supabase SQL Editor
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

**Your deployment is complete! 🎉**

Users can now:
- Sign up and create accounts
- Login securely
- Manage their profiles
- Access role-based features

Admins can:
- Manage all users
- Create/edit/delete user accounts
- Assign roles
- View user statistics

