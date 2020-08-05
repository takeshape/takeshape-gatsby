import assert from 'assert'
import {validate as uuidValidate} from 'uuid'
import {PluginOptionsInit, PluginOptions} from './types/takeshape'

const defaultOptions = {
  apiUrl: `https://api.takeshape.io`,
  appUrl: `https://app.takeshape.io`,
  batch: false,
  dataLoaderOptions: {},
  fetchOptions: {},
  queryConcurrency: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY || `4`),
}

// TODO: are there other valid patterns?
const apiKeyPattern = /[0-9a-z]{32}/

export const withDefaults = ({apiKey, projectId, ...options}: PluginOptionsInit): PluginOptions => {
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
