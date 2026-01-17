# 🔄 Recurring Workflow Testing Guide

## 📊 Current Status

### ✅ What's Already Built:

1. **UI Components:**
   - ✅ New Research form (on-demand + recurring)
   - ✅ Schedules page (view/manage schedules)
   - ✅ Dashboard (shows active schedule count)

2. **Backend API:**
   - ✅ `POST /api/report-run` - Receives execution data from n8n
   - ✅ `GET /api/reports/[schedule_id]` - Retrieves reports
   - ⚠️ `GET /api/schedules/due` - Exists but returns empty (client-side schedules)

3. **Data Storage:**
   - ⚠️ Schedules stored in **browser localStorage** (not server-side)
   - ✅ Reports logged to file system

---

## 🚨 **Critical Issue: Schedules are Client-Side**

**Current Problem:**
- Schedules are saved in browser localStorage
- n8n **cannot** access browser data
- API endpoint exists but can't read localStorage from server

**Solution Options:**

### **Option A: Move Schedules to Supabase** (Recommended)
Migrate schedules from localStorage to Supabase database

### **Option B: Test with Manual Trigger** (Quick Test)
Manually trigger n8n and simulate schedule data

---

## 🎯 **What You Need to Test Recurring Workflow:**

### 1. **n8n Workflow** (Do you have this?)
   - Workflow that calls your API
   - Processes research request
   - Returns formatted report

### 2. **Database Table for Schedules** (Missing)
   - Supabase `schedules` table to store recurring schedules
   - Allows n8n to fetch schedules via API

### 3. **Updated API Endpoint** (Needs fixing)
   - `GET /api/schedules/due` to read from database

---

## 🔧 **Step-by-Step Testing Guide**

### **Phase 1: Test On-Demand Research (Should Work Now)**

This tests your n8n webhook:

1. **Open your app**: http://localhost:3000/dashboard/new-research

2. **Fill the form:**
   ```
   Research Type: On-Demand Research
   Market Category: Technology & Software
   Sub-Niche: AI-powered CRM
   Geography: North America
   Email: your@email.com
   Notes: Test run
   ```

3. **Submit the form**

4. **What should happen:**
   - Form data sent to n8n webhook
   - n8n processes request
   - Report returned and saved
   - You see report in `/dashboard/reports`

5. **Check n8n:**
   - Go to your n8n dashboard
   - Check workflow executions
   - Verify it received the webhook
   - Check execution logs

---

### **Phase 2: Create a Recurring Schedule (UI Only)**

This tests the UI (but won't trigger n8n yet):

1. **Open**: http://localhost:3000/dashboard/new-research

2. **Fill the form:**
   ```
   Research Type: Recurring Research
   Market Category: Technology & Software
   Sub-Niche: AI-powered CRM
   Geography: North America
   Email: your@email.com
   Frequency: Daily
   Notes: Test schedule
   ```

3. **Submit**

4. **What should happen:**
   - Schedule saved to localStorage
   - Redirected to `/dashboard/schedules`
   - See your new schedule listed
   - Schedule shows as "Active"

5. **Verify:**
   ```javascript
   // Open browser console
   console.log(JSON.parse(localStorage.getItem('market_research_schedules')))
   ```

---

### **Phase 3: Test Report Logging API**

Test if n8n can log reports back to your app:

1. **Use Postman or curl to test the endpoint:**

```bash
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test-schedule-123",
    "industry": "Technology & Software",
    "sub_niche": "AI-powered CRM",
    "frequency": "daily",
    "run_at": "2026-01-17T10:00:00Z",
    "is_first_run": true,
    "final_report": "<h2>Test Report</h2><p>This is a test report from n8n.</p>"
  }'
```

2. **Expected Response:**
```json
{
  "status": "success",
  "message": "Report logged successfully",
  "schedule_id": "test-schedule-123"
}
```

3. **Verify Report Saved:**
   - Check `data/executions/test-schedule-123.json` file
   - Should contain your report

4. **View in UI:**
   - Go to `/dashboard/reports`
   - Won't show yet (because schedule doesn't exist in UI)

---

### **Phase 4: Fix Schedules for n8n (Required for Full Testing)**

**Current Issue:** Schedules in localStorage, n8n can't access them.

**Fix: Create Supabase Schedules Table**

1. **Run this SQL in Supabase:**

```sql
-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  market_category TEXT NOT NULL,
  sub_niche TEXT NOT NULL,
  geography TEXT NOT NULL,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON schedules(next_run);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON schedules(active);

-- RLS policies
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own schedules" ON schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON schedules
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all schedules" ON schedules
  FOR SELECT USING (auth.role() = 'service_role');
```

2. **Update the API endpoint** (I can help you do this)

3. **Migrate existing schedules** (optional)

---

## 📋 **Quick Testing Checklist**

### **Can Test Now (Without Database):**
- ✅ On-demand research form submission
- ✅ n8n webhook receiving data
- ✅ Report saving via POST /api/report-run
- ✅ Viewing reports in UI
- ✅ Creating schedules in UI (localStorage)
- ✅ Managing schedules (pause/resume/delete)

### **Need Database For:**
- ❌ n8n fetching schedules via GET /api/schedules/due
- ❌ Automated recurring execution
- ❌ Multiple users with schedules
- ❌ Schedules persisting across devices

---

## 🎯 **Recommended Testing Order:**

### **Today (No Database Required):**

1. ✅ **Test on-demand research:**
   - Submit form
   - Verify n8n receives webhook
   - Check report appears

2. ✅ **Test report logging:**
   - Use curl/Postman to POST to /api/report-run
   - Verify report is saved
   - Check file system

3. ✅ **Test schedules UI:**
   - Create schedule
   - View in Schedules page
   - Pause/resume schedule
   - Delete schedule

### **Next (With Database):**

4. ⏳ **Create Supabase schedules table**
5. ⏳ **Update API endpoints**
6. ⏳ **Create n8n recurring workflow**
7. ⏳ **Test end-to-end automation**

---

## 🔍 **What to Check/Configure:**

### **In Your App:**

1. **Environment Variables:**
   ```env
   # Make sure these are set
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

2. **n8n Webhook URLs:**
   - Check Settings → Webhooks
   - Make sure URLs point to your n8n instance
   - Verify webhooks are "Active"

3. **File System Permissions:**
   - Check `data/` folder exists (created automatically)
   - Verify reports are being saved

### **In n8n:**

1. **On-Demand Workflow:**
   - Webhook trigger configured
   - Returns proper JSON format
   - Status: Active

2. **Recurring Workflow (if exists):**
   - Schedule trigger configured
   - HTTP Request to GET /api/schedules/due
   - Loops through schedules
   - Posts back to /api/report-run

---

## 🚀 **Next Steps:**

**Tell me:**

1. ✅ **Do you have n8n set up?** 
   - Yes/No
   - URL to your n8n instance

2. ✅ **Have you tested on-demand research?**
   - Does it work?
   - Any errors?

3. ✅ **Do you want to:**
   - A) Test what works now (without database)
   - B) Set up Supabase schedules table first
   - C) Both (test now, then upgrade)

**I can help you:**
- ✅ Create the Supabase schedules table
- ✅ Update the API endpoints
- ✅ Migrate localStorage schedules to database
- ✅ Create the n8n recurring workflow
- ✅ Test everything end-to-end

---

**What would you like to test first?** 🤔

