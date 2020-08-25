import {v4 as uuidv4} from 'uuid'
import {ApolloLink} from 'apollo-link'
import {GatsbyNode, SourceNodesArgs, NodeInput} from 'gatsby'
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
import {getFixedGatsbyImage, getFluidGatsbyImage} from './images/gatsby-image-tools'

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
      // @ts-ignore
      fetch: getRateLimitedFetch(throttle),
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
    // @ts-ignore
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
    typeDefs: /* GraphQL */ `
      enum TakeShapeImageFit {
        CLAMP
        CLIP
        CROP
        FACEAREA
        FILL
        FILLMAX
        MAX
        MIN
        SCALE
      }

      enum TakeShapeImageFormat {
        GIF
        JP2
        JPG
        JXR
        PJPG
        PNG
        PNG8
        PNG32
        WEBP
      }

      type TakeShapeImageFixed {
        aspectRatio: Float!
        base64: String
        height: Int!
        width: Int!
        src: String!
        srcSet: String!
        srcWebp: String!
        srcSetWebp: String!
      }

      type TakeShapeImageFluid {
        aspectRatio: Float!
        base64: String
        sizes: String!
        src: String!
        srcSet: String!
        srcWebp: String!
        srcSetWebp: String!
      }

      extend type TS_Asset {
        fixed(
          width: Int
          height: Int
          fit: TakeShapeImageFit
          noBase64: Boolean
          quality: Int
          toFormat: TakeShapeImageFormat
          toFormatBase64: TakeShapeImageFormat
        ): TakeShapeImageFixed!
        fluid(
          maxWidth: Int
          maxHeight: Int
          fit: TakeShapeImageFit
          noBase64: Boolean
          quality: Int
          toFormat: TakeShapeImageFormat
          toFormatBase64: TakeShapeImageFormat
          srcSetBreakpoints: [Int]
        ): TakeShapeImageFluid!
      }
    `,
    resolvers: {
      TS_Asset: {
        fixed: {
          resolve(source: any, args: any, context: any, info: any) {
            return getFixedGatsbyImage(source.path, args)
          },
        },
        fluid: {
          resolve(source: any, args: any, context: any, info: any) {
            return getFluidGatsbyImage(source.path, args)
          },
        },
      },
    },
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
