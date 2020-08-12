export class HTTPError extends Error {
  public statusCode: number
  public constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export type GraphQLError = {
  locations?: [
    {
      column: number
      line: number
    },
  ]
  message: string
  type: string
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

export function formatGraphQLErrors(errors: GraphQLError[]): Error {
  const error = new Error(
    `Failed to load query batch:\n${errors.map((err) => err.message).join(`\n`)}`,
  )
  error.name = `GraphQLError`
  return error
}

export function handleGraphQLError(errors?: GraphQLError[]): Error {
  return errors ? formatGraphQLErrors(errors) : new Error(`GraphQLError`)
}
