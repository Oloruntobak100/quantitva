# 🚀 Quick Start Guide

## For Users

### Sign Up
1. Go to `/signup`
2. Enter email, password, full name, and optional company name
3. Click "Create Account"
4. You'll be redirected to login

### Login
1. Go to `/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to dashboard

### Update Your Profile
1. Click your name/avatar (sidebar or top-right)
2. Click "My Profile"
3. Update your name or company
4. Click "Save Changes"

### Logout
1. Click your avatar in the top-right corner
2. Click "Logout"
3. Confirm logout

---

## For Administrators

### 1. Become an Admin (First Time)

Run this SQL command in Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then logout and login again to see the "Users" menu.

### 2. Access User Management
- Click "Users" in the sidebar
- You'll see user statistics and a list of all users

### 3. Create a New User
1. Click "Add User" button
2. Fill in:
   - Email (required)
   - Password (required, min 6 characters)
   - Full Name
   - Company Name (optional)
   - Role (User or Administrator)
3. Click "Create User"

### 4. Edit a User
1. Click the edit (pencil) icon next to any user
2. Update their information
3. Change their role if needed (cannot change your own role)
4. Click "Save Changes"

### 5. Delete a User
1. Click the delete (trash) icon next to any user
2. Confirm deletion
3. Note: You cannot delete yourself

---

## For Developers

### Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd market_research
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create a Supabase project at https://supabase.com
   - Go to SQL Editor
   - Copy and paste contents of `supabase-auth-setup.sql`
   - Click "Run"

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

5. **Run development server**
```bash
npm run dev
```

6. **Open your browser**
   - Navigate to http://localhost:3000
   - Sign up for an account
   - Make yourself admin using the SQL command above

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import in Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all three Supabase variables
   - Select all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live site!

5. **Create Admin User**
   - Sign up through your live site
   - Run the SQL command in Supabase to make yourself admin
   - Logout and login to see admin features

---

## Common Tasks

### Make Someone an Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Demote an Admin to User
```sql
UPDATE users SET role = 'user' WHERE email = 'admin@example.com';
```

### View All Admins
```sql
SELECT email, full_name, role FROM users WHERE role = 'admin';
```

### Check User Count
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role = 'user') as regular_users
FROM users;
```

---

## Troubleshooting

### "Failed to fetch users"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify it's the service role key, not the anon key

### Cannot access Users page
- Make sure you're an admin: Run the SQL command
- Logout and login again after becoming admin

### Logout button doesn't work
- Check browser console for errors
- Verify Supabase environment variables are set correctly

### Email already exists error
- This is expected if the email is already registered
- Use a different email or login with existing account

### Environment variables not working
- Make sure you created `.env.local` (not `.env`)
- Restart development server after adding variables
- For Vercel: Redeploy after adding variables

---

## File Structure

```
market_research/
├── app/
│   ├── api/
│   │   └── users/              # User management API
│   │       ├── route.ts        # List/create users
│   │       └── [id]/route.ts   # Get/update/delete user
│   ├── dashboard/
│   │   ├── layout.tsx          # Main dashboard layout (with profile)
│   │   ├── page.tsx            # Dashboard home
│   │   ├── users/              # Admin user management
│   │   │   └── page.tsx
│   │   └── settings/           # Application settings
│   │       └── page.tsx
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── signup/
│       └── page.tsx            # Signup page
├── lib/
│   ├── auth/
│   │   ├── auth-context.tsx   # Authentication context
│   │   └── user-service.ts    # User CRUD operations
│   └── supabase/
│       ├── client.ts           # Browser client
│       └── server.ts           # Server client (admin)
├── components/
│   └── ui/                     # UI components
├── supabase-auth-setup.sql     # Database setup
├── DEPLOYMENT_GUIDE.md         # Full deployment guide
├── ENVIRONMENT_VARIABLES.md    # Environment setup
└── QUICK_START.md              # This file
```

---

## Key Features

✅ User authentication (signup/login/logout)
✅ Dynamic user profiles
✅ Role-based access control (Admin/User)
✅ Admin user management (CRUD)
✅ Email uniqueness enforcement
✅ Personal profile editing
✅ Secure API routes
✅ Production-ready

---

## Support

For detailed information, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `ENVIRONMENT_VARIABLES.md` - Environment setup details
- `USER_MANAGEMENT_COMPLETE.md` - Feature documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built

---

**Questions? Issues?**

1. Check the guides above
2. Look at console errors
3. Verify environment variables
4. Check Supabase logs
5. Review Vercel deployment logs

