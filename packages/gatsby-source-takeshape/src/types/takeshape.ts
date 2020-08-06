import {PluginOptions as _PluginOptions} from 'gatsby'
import {RequestInit} from 'node-fetch'
import {Options as DataLoaderOptions} from 'dataloader'

export interface PluginOptions extends Omit<_PluginOptions, 'plugins'> {
  apiKey: string
  apiUrl: string
  batch: boolean
  // TODO: Properly type these parameters <cacheKey, cacheMapReturnVal>
  dataLoaderOptions: DataLoaderOptions<unknown, unknown>
  fetchOptions: RequestInit
  projectId: string
  queryConcurrency: number
}

export type PluginOptionsInit = Partial<PluginOptions>

export interface ApiConfig {
  endpoint: string
  authToken?: string
  cliLogin?: boolean
  siteId?: string
  projectName?: string
  projectId?: string
  siteName?: string
}
