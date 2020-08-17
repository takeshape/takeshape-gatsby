import {PluginOptions} from '../types/takeshape'
import {tmpl} from './strings'

export enum CacheKey {
  TypeMap = `typeMap`,
  GraphQLSDL = `graphqlSdl`,
  ImageExtensions = `imageExt`,
}

export const createCacheKey = tmpl<[PluginOptions['projectId'], CacheKey, string]>(`%s-prod-%s-%s`)
