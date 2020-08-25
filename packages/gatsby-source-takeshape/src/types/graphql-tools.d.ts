import {ExecutionResult, Transform, ExecutionParams, SubschemaConfig, Executor} from 'graphql-tools'
import {GraphQLSchema, GraphQLScalarType} from 'graphql'

// GraphQL Tools has some bad types: https://github.com/ardatan/graphql-tools/issues/1585
type MyAsyncExecutor<TContext = Record<string, unknown>> = <
  TReturn = Record<string, unknown>,
  TArgs = Record<string, unknown>
>(
  params: Required<ExecutionParams<TArgs, TContext>>,
) => Promise<ExecutionResult<TReturn>>

interface MySubschemaConfig extends SubschemaConfig {
  executor?: Executor | MyAsyncExecutor
}

declare module 'graphql-tools' {
  export type AsyncExecutor = MyAsyncExecutor

  export declare function wrapSchema(
    subschemaOrSubschemaConfig: GraphQLSchema | MySubschemaConfig,
    transforms?: Array<Transform>,
  ): GraphQLSchema

  export declare function stitchSchemas({
    subschemas,
    types,
    typeDefs,
    schemas,
    onTypeConflict,
    resolvers,
    schemaDirectives,
    inheritResolversFromInterfaces,
    mergeTypes,
    mergeDirectives,
    logger,
    allowUndefinedInResolve,
    resolverValidationOptions,
    directiveResolvers,
    schemaTransforms,
    parseOptions,
    pruningOptions,
  }: IStitchSchemasOptions): GraphQLSchema
}
