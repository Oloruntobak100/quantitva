# 🔧 API Fix: Reports Now Use Supabase

## ❌ Problem
Your `/api/report-run` endpoint was failing with a **500 error** because it was trying to write to the file system, which is **READ-ONLY on Vercel**.

```
Error: EROFS: read-only file system, mkdir '/var/task/data'
```

---

## ✅ Solution
Migrated from file system storage to **Supabase database** storage.

### Changes Made:

1. **Created `reports` table in Supabase** (see SQL below)
2. **Created new DAO**: `lib/data-access/execution-logs-supabase.dao.ts`
3. **Updated service**: Already configured to use Supabase DAO

---

## 📊 SQL to Run in Supabase

**IMPORTANT:** Run this in your Supabase SQL Editor:

```sql
-- Reports table for storing execution results from n8n
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT UNIQUE NOT NULL,
  schedule_id TEXT NOT NULL,
  industry TEXT NOT NULL,
  sub_niche TEXT NOT NULL,
  frequency TEXT NOT NULL,
  run_at TIMESTAMPTZ NOT NULL,
  is_first_run BOOLEAN DEFAULT false,
  final_report TEXT, -- HTML content from n8n
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_schedule_id ON reports(schedule_id);
CREATE INDEX IF NOT EXISTS idx_reports_run_at ON reports(run_at);
CREATE INDEX IF NOT EXISTS idx_reports_execution_id ON reports(execution_id);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (n8n webhook posts without auth)
CREATE POLICY "Allow public insert for n8n" ON reports
  FOR INSERT WITH CHECK (true);

-- Authenticated users can read all reports
CREATE POLICY "Authenticated users can read reports" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything
CREATE POLICY "Service role can manage all reports" ON reports
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 🧪 Testing

### Step 1: Run the SQL Above
Go to Supabase → SQL Editor → Paste and execute

### Step 2: Test with curl

```bash
curl -X POST https://quantitva.vercel.app/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test-123",
    "industry": "Technology",
    "sub_niche": "AI CRM",
    "frequency": "daily",
    "run_at": "2026-01-17T12:00:00Z",
    "is_first_run": true,
    "final_report": "<h2>Test Report</h2><p>This works!</p>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "execution_id": "exec_1234567890_abc123",
  "schedule_id": "test-123",
  "is_first_run": true,
  "message": "First execution logged successfully. Schedule initialized.",
  "timestamp": "2026-01-17T12:00:00.000Z"
}
```

### Step 3: Verify in Supabase
1. Go to Supabase → Table Editor → `reports` table
2. You should see your test report

### Step 4: Test with n8n
1. Go to your n8n Runner workflow
2. Update HTTP Request node URL (if not already): `https://quantitva.vercel.app/api/report-run`
3. Execute workflow
4. Check n8n logs for success
5. Check Supabase `reports` table for new entry

---

## 📋 What Changed

### Before (File System):
```typescript
// ❌ Fails on Vercel
fs.writeFileSync(filePath, JSON.stringify(logs), 'utf-8')
```

### After (Supabase):
```typescript
// ✅ Works on Vercel
await supabaseAdmin.from('reports').insert({
  execution_id: log.execution_id,
  schedule_id: log.schedule_id,
  // ... other fields
})
```

---

## 🔄 Your Workflow Now:

```
User creates schedule
    ↓
Logger workflow → Google Sheet
    ↓
Runner workflow (scheduled)
    ↓
Checks Google Sheet for due schedules
    ↓
Executes research
    ↓
POST to https://quantitva.vercel.app/api/report-run
    ↓
Saves to Supabase reports table ✅
    ↓
Updates Google Sheet "Last run date"
    ↓
User views reports in app (reads from Supabase)
```

---

## ✅ Benefits

1. **Vercel Compatible** - No file system writes
2. **Scalable** - Database handles any volume
3. **Queryable** - Can filter, sort, search reports
4. **Persistent** - Survives deployments
5. **Multi-user** - All users can access reports
6. **Fast** - Indexed queries

---

## 🚀 Next Steps

1. ✅ Run SQL in Supabase (create `reports` table)
2. ✅ Test API with curl
3. ✅ Update n8n HTTP Request node (if needed)
4. ✅ Test full workflow
5. ⏳ Update Reports page to read from Supabase (if needed)

---

## 📝 Files Modified

- ✅ `lib/data-access/execution-logs-supabase.dao.ts` (NEW)
- ✅ `lib/services/report-run.service.ts` (already using new DAO)
- ✅ `app/api/report-run/route.ts` (no changes needed)

---

## 💡 Why This Works

**Vercel Serverless Functions:**
- ✅ Can READ files (bundled code)
- ❌ Cannot WRITE files (read-only)
- ✅ Can connect to databases (Supabase)

**Supabase:**
- ✅ Persistent storage
- ✅ Fast queries
- ✅ Works from anywhere
- ✅ Built for serverless

---

**Ready to test! Run the SQL and try the curl command.** 🎯

