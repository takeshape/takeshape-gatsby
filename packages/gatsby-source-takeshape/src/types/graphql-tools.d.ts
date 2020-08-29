import {
  ExecutionResult,
  Transform,
  ExecutionParams,
  SubschemaConfig,
  Executor,
  IntrospectionOptions,
} from 'graphql-tools'
import {GraphQLSchema, GraphQLScalarType} from 'graphql'

declare module 'graphql-tools' {
  // GraphQL Tools has some bad types: https://github.com/ardatan/graphql-tools/issues/1585
  export declare type AsyncExecutor<TContext = Record<string, unknown>> = <
    TReturn = Record<string, unknown>,
    TArgs = Record<string, unknown>
  >(
    params: Required<ExecutionParams<TArgs, TContext>>,
  ) => Promise<ExecutionResult<TReturn>>

  interface MySubschemaConfig extends SubschemaConfig {
    executor?: Executor | AsyncExecutor
  }

  export declare function wrapSchema(
    subschemaOrSubschemaConfig: GraphQLSchema | MySubschemaConfig,
    transforms?: Array<Transform>,
  ): GraphQLSchema

  export declare function introspectSchema(
    executor: AsyncExecutor,
    context?: Record<string, unknown>,
    options?: IntrospectionOptions,
  ): Promise<GraphQLSchema>
}
