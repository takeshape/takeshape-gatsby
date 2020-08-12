import { ASTNode } from 'gatsby/graphql';
export interface MergeResult {
    query: ASTNode;
    variables: Record<string, unknown>;
}
/**
 * Merge multiple queries into a single query in such a way that query results
 * can be split and transformed as if they were obtained by running original queries.
 *
 * Merging algorithm involves several transformations:
 *  1. Replace top-level fragment spreads with inline fragments (... on Query {})
 *  2. Add unique aliases to all top-level query fields (including those on inline fragments)
 *  3. Prefix all variable definitions and variable usages
 *  4. Prefix names (and spreads) of fragments with variables
 *  5. Dedupe repeating fragments
 *
 * i.e transform:
 *   [
 *     `query Foo($id: ID!) { foo, bar(id: $id), ...FooQuery }
 *     fragment FooQuery on Query { baz }`,
 *
 *    `query Bar($id: ID!) { foo: baz, bar(id: $id), ... on Query { baz } }`
 *   ]
 * to:
 *   query (
 *     $gatsby1_id: ID!
 *     $gatsby2_id: ID!
 *   ) {
 *     gatsby1_foo: foo,
 *     gatsby1_bar: bar(id: $gatsby1_id)
 *     ... on Query @originalFragment(name: "FooQuery") {
 *       gatsby1_baz: baz
 *     }
 *     gatsby2_foo: baz
 *     gatsby2_bar: bar(id: $gatsby2_id)
 *     ... on Query {
 *       gatsby2_baz: baz
 *     }
 *   }
 *   fragment FooQuery on Query { baz }
 */
export declare function merge(queries: any[]): MergeResult;
/**
 * Split and transform result of the query produced by the `merge` function
 */
export declare function resolveResult(mergedQueryResult: {
    data: any;
}): {
    data: unknown;
}[];
//# sourceMappingURL=merge-queries.d.ts.map