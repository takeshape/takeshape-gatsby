import {ExecutionResult, Transform} from '@graphql-tools/utils'
import {ExecutionParams, SubschemaConfig, Executor} from '@graphql-tools/delegate'
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

declare module '@graphql-tools/delegate' {
  export type AsyncExecutor = MyAsyncExecutor
}

declare module '@graphql-tools/wrap' {
  export declare function wrapSchema(
    subschemaOrSubschemaConfig: GraphQLSchema | MySubschemaConfig,
    transforms?: Array<Transform>,
  ): GraphQLSchema
}
