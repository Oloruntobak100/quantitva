# 👑 Admin System Setup & Configuration

## 🎯 System Overview

Your application now has comprehensive role-based access control with these features:

### Admin Capabilities:
- ✅ Access to Settings page (admin-only)
- ✅ View ALL reports from all users
- ✅ See who generated each report
- ✅ Manage users (create, edit, delete, change roles)
- ✅ Manage webhooks
- ✅ View all schedules
- ✅ Comprehensive user activity oversight

### Regular User Capabilities:
- ✅ Create on-demand reports
- ✅ Create recurring schedules
- ✅ View only their own reports
- ✅ Manage only their own schedules

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Super Admin User**

Run this SQL in **Supabase SQL Editor**:

```sql
-- ============================================
-- STEP 1: CREATE SUPER ADMIN USER
-- ============================================

-- This creates the admin user: pat2echo@gmail.com
-- Password: pat2echo

-- First, check if user already exists
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'pat2echo@gmail.com';

-- If user doesn't exist, you need to sign them up through the UI first
-- OR create them via Supabase Dashboard: Authentication → Add User
-- Email: pat2echo@gmail.com
-- Password: pat2echo
-- Auto Confirm User: YES

-- After user is created, set them as admin:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'pat2echo@gmail.com';

-- Also add to public.users table if using the user management system:
-- This will be done automatically if you have triggers set up
-- Otherwise, manually insert:
INSERT INTO public.users (id, email, full_name, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'pat2echo@gmail.com'),
  'pat2echo@gmail.com',
  'Super Admin',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

---

### **Step 2: Convert All Other Users to Regular Users**

Run this SQL to ensure all other users are set as regular users:

```sql
-- ============================================
-- STEP 2: SET ALL OTHER USERS AS REGULAR USERS
-- ============================================

-- Update auth.users metadata (except super admin)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"user"'
)
WHERE email != 'pat2echo@gmail.com'
  AND email != 'admin@quantitva.com'; -- Keep this as admin if it exists

-- Update public.users table (if you're using it)
UPDATE public.users
SET role = 'user'
WHERE email != 'pat2echo@gmail.com'
  AND email != 'admin@quantitva.com';

-- Verify the changes:
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  pu.role as public_role
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
ORDER BY u.email;
```

---

### **Step 3: Verify Admin Access**

After running the above scripts:

1. **Sign in as Super Admin**
   - Email: `pat2echo@gmail.com`
   - Password: `pat2echo`

2. **Check Admin Access**
   - You should see "Settings" menu in sidebar
   - Click Settings → User Management
   - You should see ALL users
   - Try changing a user's role (user ↔ admin)

3. **Check Reports Access**
   - Go to Reports page
   - As admin, you should see ALL reports from all users
   - You should see usernames/emails on each report

---

## 🔐 Admin Privileges Breakdown

### Settings Page (Admin Only)

**Location**: `/dashboard/settings`

**Tabs**:
1. **Webhooks Management**
   - Add, edit, delete webhooks
   - Test webhook endpoints
   - Activate/deactivate webhooks
   - Configure for on-demand or recurring reports

2. **User Management**
   - View all users with stats (Total, Admins, Regular Users)
   - Create new users
   - Edit user profiles and roles
   - Delete users (except self)
   - Change user roles (promote to admin, demote to user)

**Access Control**: Only users with role 'admin' can see Settings menu

---

### Reports Page (Enhanced for Admin)

**Admin View**:
- See ALL reports (on-demand + recurring)
- See who generated each report (name, email)
- Filter by user
- Filter by report type (on-demand, recurring)
- View user activity statistics

**Regular User View**:
- See only their own reports
- No user information displayed (not needed)

---

### Dashboard Statistics (Enhanced for Admin)

**Admin View**:
- Total reports across all users
- Breakdown by user
- Total active schedules across all users
- System-wide analytics

**Regular User View**:
- Only their own statistics
- Only their own reports count
- Only their own schedules

---

## 🛡️ Role-Based Access Control (RBAC) Logic

The system checks admin status in this order:

```typescript
const isAdmin = 
  user.user_metadata?.role === 'admin' ||     // Primary method
  user.app_metadata?.role === 'admin' ||      // Fallback
  user.email === 'admin@quantitva.com' ||     // Legacy admin
  user.email === 'pat2echo@gmail.com'         // Super admin
```

**Implementation Locations**:
- `app/api/reports/route.ts` (Line 49-51)
- `app/api/schedules/all/route.ts` (Line 35-37)
- `app/api/schedules/active/route.ts` (Line 35-37)
- `app/dashboard/layout.tsx` (Line 44 - navigation filtering)

---

## 📊 Database Schema

### `auth.users` table (Supabase Auth)
```sql
-- Important fields:
- id: UUID (primary key)
- email: TEXT
- raw_user_meta_data: JSONB  ← Contains { role: 'admin' | 'user' }
- raw_app_meta_data: JSONB
```

### `public.users` table (Your Custom Table)
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role user_role DEFAULT 'user' NOT NULL,  -- admin | user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create enum for roles
CREATE TYPE user_role AS ENUM ('admin', 'user');
```

---

## 🔧 Advanced Admin Features (To Be Added)

### Password Management
```typescript
// Allow admin to reset user passwords
PUT /api/users/[id]/reset-password
Body: { newPassword: string }
```

### Account Lock/Unlock
```typescript
// Lock user account
POST /api/users/[id]/lock
// Unlock user account  
POST /api/users/[id]/unlock
```

### User Activity Tracking
- Track login times
- Track report generation
- Track schedule creation
- View user activity logs

---

## ✅ Testing Checklist

After setup, verify:

- [ ] Super admin (`pat2echo@gmail.com`) can see Settings menu
- [ ] Super admin can view ALL reports
- [ ] Super admin can create/edit/delete users
- [ ] Super admin can change user roles
- [ ] Regular users CANNOT see Settings menu
- [ ] Regular users see only their own reports
- [ ] Regular users see only their own schedules
- [ ] Navigation properly hides Settings for non-admins

---

## 🆘 Troubleshooting

### "Settings menu not visible"
**Solution**: 
```sql
-- Verify user role in database:
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'pat2echo@gmail.com';

-- Should return: role = 'admin'
-- If not, re-run Step 1
```

### "Can't see all reports as admin"
**Solution**: Check `/app/api/reports/route.ts` line 49-51 and ensure:
```typescript
const isAdmin = 
  user.user_metadata?.role === 'admin' ||
  user.app_metadata?.role === 'admin' ||
  user.email === 'pat2echo@gmail.com'
```

### "Other users showing as admin"
**Solution**: Re-run Step 2 to reset all users to 'user' role

---

## 📝 Next Steps

1. ✅ Run Step 1 to create super admin
2. ✅ Run Step 2 to set all other users as regular users
3. ✅ Test login as super admin
4. ✅ Verify Settings menu is visible
5. ✅ Test user management features
6. ⏳ Add enhanced admin features (password reset, account lock)
7. ⏳ Add user activity tracking
8. ⏳ Add audit logs

---

**Your admin system is now ready for production!** 🎉

