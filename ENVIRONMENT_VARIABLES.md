# Environment Variables

This file documents all environment variables used in the application.

## Required Variables

### Supabase Configuration

These variables are required for authentication and database access:

```env
# Public variables (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Secret variables (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Variable Descriptions

| Variable | Type | Description | Where to find |
|----------|------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Public API key for client-side operations | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Admin API key for server-side operations | Supabase Dashboard → Settings → API → service_role key |

## Setup Instructions

### Local Development

1. Create a `.env.local` file in the root directory
2. Add the variables above with your Supabase credentials
3. Restart your development server

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Production (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - Name: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value: Your value
   - Environments: Select all (Production, Preview, Development)
3. Click "Save"
4. Redeploy your application

### Production (Other Platforms)

Add the same environment variables through your platform's dashboard or CLI.

## Security Notes

⚠️ **Important:**

- **NEVER** commit `.env.local` to Git (it's already in `.gitignore`)
- **NEVER** share `SUPABASE_SERVICE_ROLE_KEY` publicly
- The service role key bypasses all Row Level Security (RLS) policies
- Only use service role key in server-side code (`app/api/` routes)
- `NEXT_PUBLIC_*` variables are visible in browser - don't put secrets there

## Validation

### Check if variables are loaded (local development):

```bash
# Start dev server
npm run dev

# If you see errors about missing environment variables,
# check that .env.local exists and has all required variables
```

### Check if variables are loaded (production):

1. Deploy your app
2. Try to sign up or login
3. If you get authentication errors, check Vercel environment variables
4. Verify all three variables are set for all environments

## Troubleshooting

### Error: "supabaseUrl is required"

**Problem:** `NEXT_PUBLIC_SUPABASE_URL` is not set

**Solution:** 
- Local: Add to `.env.local`
- Production: Add to Vercel environment variables

### Error: "supabaseKey is required"

**Problem:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set

**Solution:** 
- Local: Add to `.env.local`
- Production: Add to Vercel environment variables

### Error: "Unauthorized" or "Forbidden" in user management

**Problem:** `SUPABASE_SERVICE_ROLE_KEY` is not set or incorrect

**Solution:** 
- Verify you copied the service_role key (not anon key)
- Local: Add to `.env.local`
- Production: Add to Vercel environment variables and redeploy

### Changes not taking effect in production

**Problem:** Environment variables updated but app still uses old values

**Solution:** 
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → "..." menu → "Redeploy"
3. Check "Use existing build cache" is unchecked
4. Click "Redeploy"

## Example .env.local

```env
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Your Supabase project URL (find in Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Your Supabase anon/public key (find in Settings → API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0NjQwMCwiZXhwIjoxOTUyMTIyNDAwfQ.example

# Your Supabase service_role key (find in Settings → API) - KEEP SECRET!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NTQ2NDAwLCJleHAiOjE5NTIxMjI0MDB9.example
```

## Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

