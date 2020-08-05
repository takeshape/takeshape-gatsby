export class HTTPError extends Error {
  public statusCode: number
  public constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export function formatErrorMessage(error: Error | HTTPError, activity: string): Error {
  if (`statusCode` in error) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return new Error(
        `Insufficient Permissions to develop with TakeShape CLI. Your account must have the "Admin" role or better.`,
      )
    }
    if (error.statusCode === 500) {
      return new Error(`A Server error occurred while ${activity}.`)
    }
  }
  return error
}

export function handleHttpErrors(error: Error | HTTPError, activity: string): void {
  throw formatErrorMessage(error, activity)
}
