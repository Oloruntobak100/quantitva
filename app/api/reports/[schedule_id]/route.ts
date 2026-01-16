// GET /api/reports/:schedule_id - Retrieve all execution logs for a schedule

import { NextRequest, NextResponse } from 'next/server'
import { ReportsListResponse } from '@/lib/types/execution.types'
import { getReportsBySchedule } from '@/lib/services/report-run.service'
import {
  createErrorResponse,
  handleUnexpectedError,
  logApiRequest,
  logApiResponse
} from '@/lib/utils/error-handler'

/**
 * GET /api/reports/:schedule_id
 * 
 * Retrieves all execution logs for a specific schedule
 * Logs are sorted by execution time (most recent first)
 * 
 * Path parameters:
 * - schedule_id: Unique identifier for the schedule
 * 
 * Response:
 * {
 *   "success": true,
 *   "schedule_id": "string",
 *   "total_executions": number,
 *   "executions": [
 *     {
 *       "execution_id": "string",
 *       "schedule_id": "string",
 *       "industry": "string",
 *       "sub_niche": "string",
 *       "frequency": "string",
 *       "run_at": "ISO timestamp",
 *       "is_first_run": boolean,
 *       "final_report": "string",
 *       "created_at": "ISO timestamp",
 *       "status": "success" | "failed"
 *     }
 *   ]
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schedule_id: string }> }
) {
  try {
    // Next.js 16: params is now a Promise
    const { schedule_id } = await params
    
    // Log incoming request
    logApiRequest('GET', `/api/reports/${schedule_id}`)
    
    // Validate schedule_id parameter
    if (!schedule_id || schedule_id.trim().length === 0) {
      const response = createErrorResponse(
        'Invalid schedule_id',
        'schedule_id parameter is required and cannot be empty',
        400
      )
      logApiResponse('GET', `/api/reports/${schedule_id}`, 400, await response.json())
      return response
    }
    
    // Get reports for the schedule
    const result: ReportsListResponse = await getReportsBySchedule(schedule_id)
    
    // Log response
    logApiResponse('GET', `/api/reports/${schedule_id}`, 200, {
      ...result,
      executions: `[${result.executions.length} execution(s)]`
    })
    
    // Return success response
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    // Handle unexpected errors
    const errorResponse = handleUnexpectedError(error)
    // Try to get schedule_id from params if available
    let scheduleId = 'unknown'
    try {
      const resolvedParams = await params
      scheduleId = resolvedParams?.schedule_id || 'unknown'
    } catch {}
    logApiResponse('GET', `/api/reports/${scheduleId}`, 500, await errorResponse.json())
    return errorResponse
  }
}

/**
 * POST /api/reports/:schedule_id - Not allowed
 * Only GET method is supported
 */
export async function POST() {
  return createErrorResponse(
    'Method not allowed',
    'Only GET requests are allowed on this endpoint',
    405
  )
}

/**
 * OPTIONS /api/reports/:schedule_id - CORS preflight support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

