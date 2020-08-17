import {v4 as uuidv4} from 'uuid'
import {ApolloLink} from 'apollo-link'
import {
  GatsbyNode,
  SourceNodesArgs,
  NodeInput,
  CreateSchemaCustomizationArgs,
  CreateNodeArgs,
  CreateResolversArgs,
} from 'gatsby'
import {buildSchema, printSchema, GraphQLSchema} from 'gatsby/graphql'
import {linkToExecutor} from '@graphql-tools/links'
// import {mergeSchemas} from '@graphql-tools/merge'
import {wrapSchema, introspectSchema, RenameTypes} from '@graphql-tools/wrap'
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
import {stitchSchemas, forwardArgsToSelectionSet} from '@graphql-tools/stitch'
import {makeExecutableSchema} from '@graphql-tools/schema'
import {delegateToSchema} from '@graphql-tools/delegate'
// import {IResolvers, ITypeDefinitions, selection} from '@graphql-tools/utils'
// import {extendImageNode} from './images/extend-image-node'

const isDevelopMode = process.env.gatsby_executing_command === `develop`
const typeName = `TS`
const fieldName = `takeshape`
const nodeType = `TakeShapeSource`

const createUri = tmpl<[string, string]>(`%s/project/%s/graphql`)
const createCacheKey = tmpl<[string, string]>(`gatsby-source-takeshape-schema-%s-%s`)
const createSourceNodeId = tmpl<[string]>(`gatsby-source-takeshape-%s`)

// const typeDefs: ITypeDefinitions = /* GraphQL */ `
//   type TakeShapeFluid {
//     name: String!
//   }
// `

// const resolvers: IResolvers = {
//   TakeShapeFluid: {
//     name: () => ({name: `John Doe`}),
//   },
// }

// const localSchema = makeExecutableSchema({typeDefs, resolvers})

// const linkTypeDefs = `
//   extend type Asset {
//     fluid: TakeShapeFluid
//   }
// `

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

  // const remoteSchema = wrapSchema(
  //   {
  //     schema: introspectionSchema,
  //     executor,
  //   },
  //   [
  //     new StripNonQueryTransform(),
  //     new RenameTypes((name) => `${typeName}_${name}`),
  //     new NamespaceUnderFieldTransform({
  //       typeName,
  //       fieldName,
  //       resolver,
  //     }),
  //     // new TransformObjectFields(testFieldTransformer, testFieldNodeTransformer),
  //   ],
  // )

  const remoteSubschemaConfig = {
    schema: introspectionSchema,
    executor,
    transforms: [
      new StripNonQueryTransform(),
      new RenameTypes((name) => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform({
        typeName,
        fieldName,
        resolver,
      }),
    ],
  }

  const fluidSubschemaConfig = {
    schema: makeExecutableSchema({
      typeDefs: /* GraphQL */ `
        type FluidImage {
          name: String
        }

        type Query {
          fluid(path: String!): FluidImage
        }
      `,
      resolvers: {
        Query: {
          fluid(obj, args) {
            return {
              name: args.path,
            }
          },
        },
      },
    }),
  }

  const schema = stitchSchemas({
    mergeTypes: true,
    subschemas: [remoteSubschemaConfig, fluidSubschemaConfig],
    typeDefs: /* GraphQL */ `
      extend type TS_Asset {
        fluid: FluidImage!
      }
    `,
    resolvers: {
      TS_Asset: {
        fluid: {
          selectionSet: `{ path }`,
          // selectionSet: forwardArgsToSelectionSet(`{ path }`),
          // fragment: ` ... on TS_Asset { path } `,
          resolve(obj: any, args: any, context: any, info: any) {
            console.log(`path: ${obj.path}`)
            console.log({obj, args, info})
            console.dir(info.operation.selectionSet, {depth: 3})
            return delegateToSchema({
              schema: fluidSubschemaConfig,
              operation: `query`,
              fieldName: `fluid`,
              args: {path: obj.path},
              context,
              info,
            })
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

// export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async ({
//   actions,
// }: CreateSchemaCustomizationArgs) => {
//   const {createTypes} = actions

//   const typeDefs = /* GraphQL */ `
//     extend type TS_Asset {
//       fluid: String
//     }
//   `

//   createTypes(typeDefs)
// }

// export const createResolvers: GatsbyNode['createResolvers'] = async ({
//   createResolvers,
// }: CreateResolversArgs): Promise<void> => {
//   const resolvers = {
//     TS_Asset: {
//       testfield: {
//         type: `String`,
//         resolve(source: any, args: any, context: any, info: any) {
//           console.log(source, args, context, info)
//           return 'test'
//         },
//       },
//     },
//   }
//   createResolvers(resolvers)
// }
