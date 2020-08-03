import {print, ASTNode} from 'graphql'
import nodeFetch, {RequestInfo, RequestInit, HeadersInit} from 'node-fetch'

export interface GraphQLRequestQuery {
  query: ASTNode
  variables: Record<string, unknown>
}

export interface GraphQLRequestOptions {
  fetch: typeof nodeFetch
  fetchOptions: RequestInit
  headers: HeadersInit
  uri: RequestInfo
}

export type GraphQLQueryResponse<T = Record<string, unknown>> = {
  success: true
  data: T
}

export type GraphQLQueryResponseError = {
  success: false
  errors?: [
    {
      locations?: [
        {
          column: number
          line: number
        },
      ]
      message: string
      type: string
    },
  ]
}

type GraphQLQueryResult<T> = GraphQLQueryResponse<T> | GraphQLQueryResponseError

export async function graphQLRequest<DataType>(
  query: GraphQLRequestQuery,
  options: GraphQLRequestOptions,
): Promise<GraphQLQueryResult<DataType>> {
  const {uri, fetch, fetchOptions, headers} = options

  try {
    const body = JSON.stringify({
      query: print(query.query),
      variables: query.variables,
    })

    const response = await fetch(uri, {
      method: `POST`,
      ...fetchOptions,
      headers: {
        ...headers,
        'Content-Type': `application/json`,
      },
      body,
    })

    const responseJson = await response.json()

    if (responseJson.errors) {
      return {
        success: false,
        ...responseJson,
      } as GraphQLQueryResponseError
    }

    return {
      success: true,
      ...responseJson,
    } as GraphQLQueryResponse<DataType>
  } catch (err) {
    return {
      success: false,
      errors: [{message: err.message, type: `GraphQL request failed`}],
    } as GraphQLQueryResponseError
  }
}

export function formatErrors(result: GraphQLQueryResponseError): string {
  if (result.errors) {
    return result.errors.map((error) => error.message).join(`\n`)
  }

  return `Unexpected GraphQL result`
}