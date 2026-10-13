export type ApiErrorCode = 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION' | 'UNKNOWN'

export class ApiError extends Error {
  code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}
