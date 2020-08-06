import {v4 as uuidv4} from 'uuid'
import {ApolloLink} from 'apollo-link'
import {GatsbyNode, SourceNodesArgs, NodeInput} from 'gatsby'
import {buildSchema, printSchema, GraphQLSchema} from 'gatsby/graphql'
import {linkToExecutor} from '@graphql-tools/links'
import {wrapSchema, introspectSchema, RenameTypes} from '@graphql-tools/wrap'
import {createHttpLink} from 'apollo-link-http'
import fetch, {HeadersInit as FetchHeaders} from 'node-fetch'
import {createContentDigest} from 'gatsby-core-utils'
import {NamespaceUnderFieldTransform, StripNonQueryTransform} from './transforms'
import {createDataloaderLink} from './batching/dataloader-link'
import {withDefaults} from './options'
import {PluginOptionsInit} from './types/takeshape'
import {GatsbyGraphQLFieldResolver} from './types/gatsby'
import {subscribe} from './utils/pusher'
import {tmpl} from './utils/strings'

const isDevelopMode = process.env.gatsby_executing_command === `develop`

const typeName = `TS`
const fieldName = `takeshape`
const nodeType = `TakeShapeSource`

const createUri = tmpl<[string, string]>(`%s/project/%s/graphql`)
const createCacheKey = tmpl<[string, string]>(`gatsby-source-takeshape-schema-%s-%s`)
const createSourceNodeId = tmpl<[string]>(`gatsby-source-takeshape-%s`)

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  {actions, createNodeId, cache, reporter}: SourceNodesArgs,
  options: PluginOptionsInit = {} as PluginOptionsInit,
): Promise<void> => {
  const {createNode, addThirdPartySchema} = actions
  const config = withDefaults(options)

  const {
    apiKey,
    apiUrl,
    batch,
    projectId,
    fetchOptions,
    dataLoaderOptions,
    queryConcurrency,
  } = config

  const uri = createUri(apiUrl, projectId)

  const headers = {
    'Content-Type': `application/json`,
    Authorization: `Bearer ${apiKey}`,
  } as FetchHeaders

  let link: ApolloLink

  if (batch) {
    reporter.info(`[takeshape] Using DataLoader`)
    link = createDataloaderLink({
      uri,
      fetchOptions,
      headers,
      dataLoaderOptions,
      queryConcurrency,
    })
  } else {
    link = createHttpLink({
      uri,
      fetch,
      fetchOptions,
      headers,
    })
  }

  let introspectionSchema: GraphQLSchema

  const cacheKey = createCacheKey(typeName, fieldName)

  let sdl = await cache.get(cacheKey)

  const executor = linkToExecutor(link)

  reporter.info(`[takeshape] Fetching remote schema`)

  if (!sdl) {
    introspectionSchema = await introspectSchema(executor)
    sdl = printSchema(introspectionSchema)
  } else {
    introspectionSchema = buildSchema(sdl)
  }

  await cache.set(cacheKey, sdl)

  const nodeId = createNodeId(createSourceNodeId(typeName))
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
  })
  createNode(node)

  const resolver: GatsbyGraphQLFieldResolver = (_, __, context) => {
    context.nodeModel.createPageDependency({
      path: context.path || ``,
      nodeId,
    })
    return {}
  }

  const schema = wrapSchema(
    {
      schema: introspectionSchema,
      executor,
    },
    [
      new StripNonQueryTransform(),
      new RenameTypes((name) => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform({
        typeName,
        fieldName,
        resolver,
      }),
    ],
  )

  addThirdPartySchema({schema})

  // Only need to subscribe to updates in develop mode
  if (isDevelopMode) {
    subscribe(config, reporter, () => {
      createNode(
        createSchemaNode({
          id: nodeId,
          typeName,
          fieldName,
        }),
      )
    })
  }
}

function createSchemaNode({
  id,
  typeName,
  fieldName,
}: Pick<NodeInput, 'id' | 'typeName' | 'fieldName'>): NodeInput {
  return {
    id,
    typeName,
    fieldName,
    children: [],
    internal: {
      type: nodeType,
      contentDigest: createContentDigest(uuidv4()),
    },
  }
}
