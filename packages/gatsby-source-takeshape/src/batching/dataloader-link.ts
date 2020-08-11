import DataLoader from 'dataloader'
import {HeadersInit} from 'node-fetch'
import {ApolloLink, Observable} from 'apollo-link'
import {merge, resolveResult} from './merge-queries'
import {graphQLRequest, formatErrors} from '../utils/requests'
import {PluginOptions} from '../utils/options'
import {Fetch} from '../types/fetch'
import {ASTNode} from 'gatsby/graphql'

export interface CreateDataloaderLinkOptions
  extends Required<
    Pick<PluginOptions, 'headers' | 'fetchOptions' | 'dataLoaderOptions' | 'queryConcurrency'>
  > {
  fetch: Fetch
  headers: HeadersInit
  uri: string
}

type Variables = Record<string, unknown>

export interface Key {
  query: ASTNode
  variables: Variables
}

export function createDataloaderLink(options: CreateDataloaderLinkOptions): ApolloLink {
  const load = async (keys: readonly Key[]) => {
    const result = await graphQLRequest<Variables>(merge(keys), options)
    if (result.success === false) {
      const error = new Error(`Failed to load query batch:\n${formatErrors(result)}`)
      error.name = `GraphQLError`
      throw error
    }

    return resolveResult(result)
  }

  const {queryConcurrency} = options
  const maxBatchSize = Math.min(4, Math.round(queryConcurrency / 5))

  const dataloader = new DataLoader<Key, unknown>(load, {
    cache: false,
    maxBatchSize,
    batchScheduleFn: (cb) => setTimeout(cb, 50),
    ...options.dataLoaderOptions,
  })

  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const {query, variables} = operation
        dataloader
          .load({query, variables})
          // How do you un-any this?
          .then((response: any) => {
            operation.setContext({response})
            observer.next(response)
            observer.complete()
            return response
          })
          .catch((err) => {
            if (err.name === `AbortError`) {
              return
            }
            observer.error(err)
          })
      }),
  )
}
