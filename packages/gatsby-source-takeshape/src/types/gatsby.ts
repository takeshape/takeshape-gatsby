import {Node} from 'gatsby'
import {GraphQLResolveInfo, GraphQLFieldConfigMap} from 'gatsby/graphql'

export interface CreatePageDependencyArgs {
  connection?: string
  path: string
  nodeId?: string
}

/**
 * Partially typed
 * https://www.gatsbyjs.org/docs/node-model/
 * https://www.gatsbyjs.org/docs/page-node-dependencies/
 * */

export type GatsbyNodeModel = {
  getNodeById: (args: {id: string}) => Node
  createPageDependency: (args: CreatePageDependencyArgs) => void
}

export type GatsbyGraphQLContext = {
  nodeModel: GatsbyNodeModel
  path?: string
}

// This return type seems for accurate, as void in a resolver seems to lead to bad schemas
export type GatsbyGraphQLFieldResolver<
  TSource = Record<string, unknown>,
  TContext = GatsbyGraphQLContext,
  TArgs = {[argName: string]: any} // eslint-disable-line @typescript-eslint/no-explicit-any
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Record<string, unknown>

export type GatsbyGraphQLConfigMap = GraphQLFieldConfigMap<
  Record<string, unknown>,
  GatsbyGraphQLContext
>

export interface GatsbyFixedImageProps {
  aspectRatio: number
  width: number
  height: number
  src: string
  srcSet: string
  base64?: string
  srcWebp?: string
  srcSetWebp?: string
}

export type GatsbyFluidImageProps = {
  aspectRatio?: number
  src: string
  srcSet: string
  sizes: string
  base64?: string
  srcWebp?: string
  srcSetWebp?: string
}
