import { Node } from 'gatsby';
import { GraphQLResolveInfo, GraphQLFieldConfigMap } from 'graphql';
export interface CreatePageDependencyArgs {
    connection?: string;
    path: string;
    nodeId?: string;
}
/**
 * Partially typed
 * https://www.gatsbyjs.org/docs/node-model/
 * https://www.gatsbyjs.org/docs/page-node-dependencies/
 * */
export declare type GatsbyNodeModel = {
    getNodeById: (args: {
        id: string;
    }) => Node;
    createPageDependency: (args: CreatePageDependencyArgs) => void;
};
export declare type GatsbyGraphQLContext = {
    nodeModel: GatsbyNodeModel;
    path?: string;
};
export declare type GatsbyGraphQLFieldResolver<TSource = Record<string, unknown>, TContext = GatsbyGraphQLContext, TArgs = {
    [argName: string]: any;
}> = (source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Record<string, unknown>;
export declare type GatsbyGraphQLConfigMap = GraphQLFieldConfigMap<Record<string, unknown>, GatsbyGraphQLContext>;
//# sourceMappingURL=gatsby.d.ts.map