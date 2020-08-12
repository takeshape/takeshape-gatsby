import DataLoader from 'dataloader'
import {HeadersInit} from 'node-fetch'
import {ApolloLink, Observable} from 'apollo-link'
import {merge, resolveResult} from './merge-queries'
import {graphQLRequest} from '../utils/requests'
import {PluginOptions} from '../types/takeshape'
import {handleGraphQLError} from '../errors'

export interface CreateDataloaderLinkOptions
  extends Required<
    Pick<PluginOptions, 'headers' | 'fetchOptions' | 'dataLoaderOptions' | 'queryConcurrency'>
  > {
  headers: HeadersInit
  uri: string
}

export function createDataloaderLink(options: CreateDataloaderLinkOptions): ApolloLink {
  // WHY? Don't feel like properly typing all this borrowed code yet.. but soon
  const load = async (keys: any) => {
    const result = await graphQLRequest<Record<string, any>>(merge(keys), options)
    if (result.success === false) {
      throw handleGraphQLError(result.errors)
    }
    return resolveResult(result)
  }

  const {queryConcurrency} = options
  const maxBatchSize = Math.min(4, Math.round(queryConcurrency / 5))

  const dataloader = new DataLoader(load, {
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
