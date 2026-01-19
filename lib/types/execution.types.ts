// Type definitions for execution logs and API payloads

/**
 * Execution log entry representing a single report run
 */
export interface ExecutionLog {
  execution_id: string
  schedule_id: string
  user_id: string // CRITICAL: User isolation
  industry: string
  sub_niche: string
  frequency: string
  run_at: string // ISO timestamp
  is_first_run: boolean
  final_report: string
  created_at: string // ISO timestamp when log was created
  status: 'success' | 'failed'
}

/**
 * Schedule metadata for tracking initialization
 */
export interface ScheduleMetadata {
  schedule_id: string
  initialized: boolean
  first_run_at: string | null
  total_executions: number
  last_execution_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Request payload for POST /api/report-run
 */
export interface ReportRunRequest {
  schedule_id: string
  user_id: string // CRITICAL: User isolation
  industry: string
  sub_niche: string
  frequency: string
  run_at: string
  is_first_run: boolean
  final_report: string
}

/**
 * Response for POST /api/report-run
 */
export interface ReportRunResponse {
  success: boolean
  execution_id: string
  schedule_id: string
  is_first_run: boolean
  message: string
  timestamp: string
}

/**
 * Response for GET /api/reports/:schedule_id
 */
export interface ReportsListResponse {
  success: boolean
  schedule_id: string
  total_executions: number
  executions: ExecutionLog[]
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false
  error: string
  details?: string
  timestamp: string
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  message: string
}

