// Validation utilities for report-run API

import { ReportRunRequest, ValidationError } from '../types/execution.types'

/**
 * Validates the report run request payload
 * @param payload - The request body to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateReportRunRequest(payload: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if payload exists
  if (!payload || typeof payload !== 'object') {
    errors.push({
      field: 'payload',
      message: 'Request body must be a valid JSON object'
    })
    return errors
  }

  // Validate user_id (CRITICAL for security)
  if (!payload.user_id) {
    errors.push({
      field: 'user_id',
      message: 'user_id is required'
    })
  } else if (typeof payload.user_id !== 'string') {
    errors.push({
      field: 'user_id',
      message: 'user_id must be a string'
    })
  } else if (payload.user_id.trim().length === 0) {
    errors.push({
      field: 'user_id',
      message: 'user_id cannot be empty'
    })
  }

  // Validate schedule_id
  if (!payload.schedule_id) {
    errors.push({
      field: 'schedule_id',
      message: 'schedule_id is required'
    })
  } else if (typeof payload.schedule_id !== 'string') {
    errors.push({
      field: 'schedule_id',
      message: 'schedule_id must be a string'
    })
  } else if (payload.schedule_id.trim().length === 0) {
    errors.push({
      field: 'schedule_id',
      message: 'schedule_id cannot be empty'
    })
  }

  // Validate industry
  if (!payload.industry) {
    errors.push({
      field: 'industry',
      message: 'industry is required'
    })
  } else if (typeof payload.industry !== 'string') {
    errors.push({
      field: 'industry',
      message: 'industry must be a string'
    })
  } else if (payload.industry.trim().length === 0) {
    errors.push({
      field: 'industry',
      message: 'industry cannot be empty'
    })
  }

  // Validate sub_niche
  if (!payload.sub_niche) {
    errors.push({
      field: 'sub_niche',
      message: 'sub_niche is required'
    })
  } else if (typeof payload.sub_niche !== 'string') {
    errors.push({
      field: 'sub_niche',
      message: 'sub_niche must be a string'
    })
  } else if (payload.sub_niche.trim().length === 0) {
    errors.push({
      field: 'sub_niche',
      message: 'sub_niche cannot be empty'
    })
  }

  // Validate frequency
  if (!payload.frequency) {
    errors.push({
      field: 'frequency',
      message: 'frequency is required'
    })
  } else if (typeof payload.frequency !== 'string') {
    errors.push({
      field: 'frequency',
      message: 'frequency must be a string'
    })
  } else {
    const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly']
    if (!validFrequencies.includes(payload.frequency.toLowerCase())) {
      errors.push({
        field: 'frequency',
        message: `frequency must be one of: ${validFrequencies.join(', ')}`
      })
    }
  }

  // Validate run_at
  if (!payload.run_at) {
    errors.push({
      field: 'run_at',
      message: 'run_at is required'
    })
  } else if (typeof payload.run_at !== 'string') {
    errors.push({
      field: 'run_at',
      message: 'run_at must be a string'
    })
  } else {
    // Validate ISO 8601 format
    const date = new Date(payload.run_at)
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'run_at',
        message: 'run_at must be a valid ISO 8601 timestamp'
      })
    }
  }

  // Validate is_first_run
  if (payload.is_first_run === undefined || payload.is_first_run === null) {
    errors.push({
      field: 'is_first_run',
      message: 'is_first_run is required'
    })
  } else if (typeof payload.is_first_run !== 'boolean') {
    errors.push({
      field: 'is_first_run',
      message: 'is_first_run must be a boolean'
    })
  }

  // Validate final_report
  if (!payload.final_report) {
    errors.push({
      field: 'final_report',
      message: 'final_report is required'
    })
  } else if (typeof payload.final_report !== 'string') {
    errors.push({
      field: 'final_report',
      message: 'final_report must be a string'
    })
  } else if (payload.final_report.trim().length === 0) {
    errors.push({
      field: 'final_report',
      message: 'final_report cannot be empty'
    })
  }

  return errors
}

/**
 * Type guard to check if payload is valid ReportRunRequest
 * @param payload - The payload to check
 * @returns True if payload is valid
 */
export function isValidReportRunRequest(payload: any): payload is ReportRunRequest {
  return validateReportRunRequest(payload).length === 0
}

