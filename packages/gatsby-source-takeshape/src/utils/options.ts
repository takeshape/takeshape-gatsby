import assert from 'assert'
import {PluginOptions as GatsbyPluginOptions} from 'gatsby'
import nodeFetch, {RequestInit} from 'node-fetch'
import {Options as DataLoaderOptions} from 'dataloader'
import {validate as uuidValidate} from 'uuid'

export interface PluginOptions extends Omit<GatsbyPluginOptions, 'plugins'> {
  apiKey?: string
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
const apiKeyPattern = /[0-9a-z]{32}/

export const withDefaults = ({
  apiKey,
  projectId,
  ...options
}: PluginOptions): Required<PluginOptions> => {
  assert(typeof apiKey === `string` && apiKey, `[takeshape] \`apiKey\` must be specified`)
  assert(apiKeyPattern.test(apiKey), `[takeshape] \`apiKey\` is invalid`)

  assert(typeof projectId === `string` && projectId, `[takeshape] \`projectId\` must be specified`)
  assert(uuidValidate(projectId), `[takeshape] \`projectId\` is invalid`)

  return {
    apiKey,
    projectId,
    ...defaultOptions,
    ...options,
  }
}
