import { GraphQLSchema } from 'gatsby/graphql';
import { Transform } from '@graphql-tools/utils';
import { GatsbyGraphQLFieldResolver } from './types/gatsby';
export declare class NamespaceUnderFieldTransform implements Transform {
    typeName: string;
    fieldName: string;
    resolver: GatsbyGraphQLFieldResolver;
    constructor({ typeName, fieldName, resolver, }: {
        typeName: string;
        fieldName: string;
        resolver: GatsbyGraphQLFieldResolver;
    });
    transformSchema(schema: GraphQLSchema): GraphQLSchema;
}
export declare class StripNonQueryTransform implements Transform {
    transformSchema(schema: GraphQLSchema): GraphQLSchema;
}
//# sourceMappingURL=transforms.d.ts.map