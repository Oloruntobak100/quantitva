// Data Access Object for execution logs - Supabase storage (Vercel compatible)

import { supabaseAdmin } from '../supabase/server'
import { ExecutionLog } from '../types/execution.types'

/**
 * Generate unique execution ID
 */
export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Save an execution log to Supabase
 */
export async function saveExecutionLog(log: ExecutionLog): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('reports')
      .insert({
        execution_id: log.execution_id,
        schedule_id: log.schedule_id,
        user_id: log.user_id, // CRITICAL: User isolation
        industry: log.industry,
        sub_niche: log.sub_niche,
        frequency: log.frequency,
        run_at: log.run_at,
        is_first_run: log.is_first_run,
        final_report: log.final_report,
      })

    if (error) {
      console.error(`Error saving execution log for schedule ${log.schedule_id}:`, error)
      throw new Error(`Failed to save execution log: ${error.message}`)
    }
  } catch (error) {
    console.error(`Unexpected error saving execution log:`, error)
    throw error
  }
}

/**
 * Get all execution logs for a schedule, sorted by execution time (most recent first)
 */
export async function getExecutionLogs(scheduleId: string): Promise<ExecutionLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('run_at', { ascending: false })

    if (error) {
      console.error(`Error reading execution logs for schedule ${scheduleId}:`, error)
      throw new Error(`Failed to read execution logs: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Unexpected error reading execution logs:`, error)
    throw error
  }
}

/**
 * Check if a schedule has any execution logs
 */
export async function hasExecutionLogs(scheduleId: string): Promise<boolean> {
  try {
    const { count, error } = await supabaseAdmin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', scheduleId)

    if (error) {
      console.error(`Error checking execution logs for schedule ${scheduleId}:`, error)
      return false
    }

    return (count || 0) > 0
  } catch (error) {
    console.error(`Unexpected error checking execution logs:`, error)
    return false
  }
}

/**
 * Get the latest execution log for a schedule
 */
export async function getLatestExecutionLog(scheduleId: string): Promise<ExecutionLog | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('run_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      console.error(`Error reading latest execution log for schedule ${scheduleId}:`, error)
      throw new Error(`Failed to read latest execution log: ${error.message}`)
    }

    return data || null
  } catch (error) {
    console.error(`Unexpected error reading latest execution log:`, error)
    return null
  }
}

/**
 * Get count of executions for a schedule
 */
export async function getExecutionCount(scheduleId: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', scheduleId)

    if (error) {
      console.error(`Error counting execution logs for schedule ${scheduleId}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`Unexpected error counting execution logs:`, error)
    return 0
  }
}

/**
 * Get all reports (for reports page)
 */
export async function getAllReports(limit: number = 50): Promise<ExecutionLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error reading all reports:`, error)
      throw new Error(`Failed to read reports: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Unexpected error reading all reports:`, error)
    throw error
  }
}

/**
 * Initialize a new schedule (just a stub for Supabase - not needed)
 */
export async function initializeSchedule(scheduleId: string): Promise<void> {
  // No initialization needed for Supabase - just return
  console.log(`Schedule ${scheduleId} initialization requested (not needed for Supabase)`)
}

/**
 * Update schedule metadata after an execution (stub for Google Sheets workflow)
 */
export async function updateScheduleMetadataAfterExecution(
  scheduleId: string,
  isFirstRun: boolean,
  runAt: string
): Promise<void> {
  // Metadata updates are handled by Google Sheets in n8n workflow
  console.log(`Metadata update for schedule ${scheduleId} (handled by n8n)`)
}

/**
 * Check if schedule is initialized (always true for Supabase)
 */
export async function isScheduleInitialized(scheduleId: string): Promise<boolean> {
  // For Supabase, check if any reports exist for this schedule
  return await hasExecutionLogs(scheduleId)
}

/**
 * Log activity (stub - can be implemented later)
 */
export async function logActivity(activity: any): Promise<void> {
  console.log('Activity logged:', activity)
  // Could be implemented to store in a separate activity_logs table
}
