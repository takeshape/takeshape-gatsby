import {v4 as uuidv4} from 'uuid'
import {ApolloLink} from 'apollo-link'
import {GatsbyNode, SourceNodesArgs, NodeInput, ParentSpanPluginArgs} from 'gatsby'
import {buildSchema, printSchema, GraphQLSchema} from 'gatsby/graphql'
import {
  linkToExecutor,
  RenameTypes,
  wrapSchema,
  introspectSchema,
  mergeSchemas,
} from 'graphql-tools'
import {createHttpLink} from 'apollo-link-http'
import {HeadersInit as FetchHeaders} from 'node-fetch'
import {createContentDigest} from 'gatsby-core-utils'
import {NamespaceUnderFieldTransform, StripNonQueryTransform} from './transforms'
import {createDataloaderLink} from './batching/dataloader-link'
import {withDefaults} from './options'
import {PluginOptionsInit} from './types/takeshape'
import {GatsbyGraphQLFieldResolver} from './types/gatsby'
import {subscribe} from './utils/pusher'
import {tmpl} from './utils/strings'
import {getRateLimitedFetch} from './rate-limiting/rate-limiting'
import {
  typeDefs as gatsbyImageTypeDefs,
  resolvers as gatsbyImageResolvers,
} from './images/gatsby-image-schema'

const isDevelopMode = process.env.gatsby_executing_command === `develop`

const typeName = `TS`
const fieldName = `takeshape`
const nodeType = `TakeShapeSource`

const createUri = tmpl<[string, string]>(`%s/project/%s/graphql`)
const createCacheKey = tmpl<[string, string]>(`takeshape-schema-%s-%s`)
const createSourceNodeId = tmpl<[string]>(`takeshape-%s`)

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
    throttle,
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
      fetch: getRateLimitedFetch(throttle),
      fetchOptions,
      headers,
      dataLoaderOptions,
      queryConcurrency,
    })
  } else {
    link = createHttpLink({
      uri,
      // Apollo is relying on DOM types here, which will not match the node-fetch types
      fetch: getRateLimitedFetch(throttle) as any,
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

  const takeshapeSchema = wrapSchema(
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

  const schema = mergeSchemas({
    schemas: [takeshapeSchema],
    typeDefs: gatsbyImageTypeDefs,
    resolvers: gatsbyImageResolvers({cache}),
  })

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
