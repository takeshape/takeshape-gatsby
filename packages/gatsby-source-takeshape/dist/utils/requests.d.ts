import { ASTNode } from 'graphql';
import nodeFetch, { RequestInfo, RequestInit, HeadersInit } from 'node-fetch';
export interface GraphQLRequestQuery {
    query: ASTNode;
    variables: Record<string, unknown>;
}
export interface GraphQLRequestOptions {
    fetch: typeof nodeFetch;
    fetchOptions: RequestInit;
    headers: HeadersInit;
    uri: RequestInfo;
}
export declare type GraphQLQueryResponse<T = Record<string, unknown>> = {
    success: true;
    data: T;
};
export declare type GraphQLQueryResponseError = {
    success: false;
    errors?: [
        {
            locations?: [
                {
                    column: number;
                    line: number;
                }
            ];
            message: string;
            type: string;
        }
    ];
};
declare type GraphQLQueryResult<T> = GraphQLQueryResponse<T> | GraphQLQueryResponseError;
export declare function graphQLRequest<DataType>(query: GraphQLRequestQuery, options: GraphQLRequestOptions): Promise<GraphQLQueryResult<DataType>>;
export declare function formatErrors(result: GraphQLQueryResponseError): string;
export {};
//# sourceMappingURL=requests.d.ts.map