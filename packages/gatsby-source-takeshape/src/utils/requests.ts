import {print, ASTNode} from 'gatsby/graphql'
import {RequestInfo, RequestInit, HeadersInit} from 'node-fetch'
import {GraphQLError} from '../errors'
import {Fetch} from '../types/fetch'

export interface GraphQLRequestQuery {
  query: ASTNode
  variables: Record<string, unknown>
}

export interface GraphQLRequestOptions {
  fetch: Fetch
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
  errors?: GraphQLError[]
}

type GraphQLQueryResult<T> = GraphQLQueryResponse<T> | GraphQLQueryResponseError

export async function graphQLRequest<DataType>(
  query: GraphQLRequestQuery,
  options: GraphQLRequestOptions,
): Promise<GraphQLQueryResult<DataType>> {
  const {fetch, uri, fetchOptions, headers} = options

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
