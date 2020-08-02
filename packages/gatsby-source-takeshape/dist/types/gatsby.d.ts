import { Node } from 'gatsby';
import { GraphQLFieldResolver, GraphQLFieldConfigMap } from 'graphql';
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
export declare type GatsbyGraphQLFieldResolver = GraphQLFieldResolver<Record<string, unknown>, GatsbyGraphQLContext>;
export declare type GatsbyGraphQLConfigMap = GraphQLFieldConfigMap<Record<string, unknown>, GatsbyGraphQLContext>;
//# sourceMappingURL=gatsby.d.ts.map