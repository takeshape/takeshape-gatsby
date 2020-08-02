import assert from 'assert'
import {PluginOptions as GatsbyPluginOptions} from 'gatsby'
import nodeFetch, {RequestInit} from 'node-fetch'
import {Options as DataLoaderOptions} from 'dataloader'

export interface PluginOptions extends Omit<GatsbyPluginOptions, 'plugins'> {
  authToken?: string
  batch?: boolean
  // TODO: Properly type these parameters <cacheKey, cacheMapReturnVal>
  dataLoaderOptions?: DataLoaderOptions<unknown, unknown>
  fetch?: typeof nodeFetch
  fetchOptions?: RequestInit
  projectId?: string
  refetchInterval?: number
  queryConcurrency?: number
}

const defaultOptions = {
  batch: false,
  dataLoaderOptions: {},
  fetch: nodeFetch,
  fetchOptions: {},
  refetchInterval: 60,
  queryConcurrency: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY || `4`),
}

// TODO: are there other valid patterns?
const authTokenPattern = /[0-9a-z]{32}/
const projecIdPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

export const withDefaults = ({
  authToken,
  projectId,
  ...options
}: PluginOptions): Required<PluginOptions> => {
  assert(typeof authToken === `string` && authToken, `[takeshape] \`authToken\` must be specified`)
  assert(authTokenPattern.test(authToken), `[takeshape] \`authToken\` is invalid`)

  assert(typeof projectId === `string` && projectId, `[takeshape] \`projectId\` must be specified`)
  assert(projecIdPattern.test(projectId), `[takeshape] \`projectId\` is invalid`)

  return {
    authToken,
    projectId,
    ...defaultOptions,
    ...options,
  }
}
