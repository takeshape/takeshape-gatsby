"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveResult = exports.merge = void 0;
const graphql_1 = require("graphql");
const strings_1 = require("../utils/strings");
const createKeyPrefix = strings_1.tmpl(`gatsby%s_`);
const keyPrefixRe = /^gatsby([\d]+)_(.*)$/;
const parsePrefixedKey = (prefixedKey) => {
    const match = keyPrefixRe.exec(prefixedKey);
    if (!match || match.length !== 3) {
        throw new Error(`Unexpected data key: ${prefixedKey}`);
    }
    return { index: Number(match[1]), originalKey: match[2] };
};
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
function merge(queries) {
    const mergedVariables = {};
    const mergedVariableDefinitions = [];
    const mergedSelections = [];
    const mergedFragmentMap = new Map();
    queries.forEach((query, index) => {
        const prefixedQuery = prefixQueryParts(createKeyPrefix(index), query);
        prefixedQuery.query.definitions.forEach((def) => {
            var _a;
            if (isQueryDefinition(def)) {
                mergedSelections.push(...def.selectionSet.selections);
                mergedVariableDefinitions.push(...((_a = def.variableDefinitions) !== null && _a !== void 0 ? _a : []));
            }
            if (isFragmentDefinition(def)) {
                // Theoretically it is possible to have fragments with the same name but different content
                // in different queries. But Gatsby validation doesn't allow this and we rely on this here
                // One example where this can occur is in gatsby-node or GraphiQL queries
                // (but those are usually not batched)
                mergedFragmentMap.set(def.name.value, def);
            }
        });
        Object.assign(mergedVariables, prefixedQuery.variables);
    });
    const mergedQueryDefinition = {
        kind: graphql_1.Kind.OPERATION_DEFINITION,
        operation: `query`,
        variableDefinitions: mergedVariableDefinitions,
        selectionSet: {
            kind: graphql_1.Kind.SELECTION_SET,
            selections: mergedSelections,
        },
    };
    return {
        query: {
            kind: graphql_1.Kind.DOCUMENT,
            definitions: [mergedQueryDefinition, ...mergedFragmentMap.values()],
        },
        variables: mergedVariables,
    };
}
exports.merge = merge;
/**
 * Split and transform result of the query produced by the `merge` function
 */
function resolveResult(mergedQueryResult) {
    const { data } = mergedQueryResult;
    return Object.keys(data).reduce((acc, prefixedKey) => {
        const { index, originalKey } = parsePrefixedKey(prefixedKey);
        if (!acc[index])
            acc[index] = { data: {} };
        acc[index].data[originalKey] = data[prefixedKey];
        return acc;
    }, []);
}
exports.resolveResult = resolveResult;
const Visitors = {
    detectFragmentsWithVariables: (fragmentsWithVariables) => {
        let currentFragmentName = null;
        return {
            [graphql_1.Kind.FRAGMENT_DEFINITION]: {
                enter: (def) => {
                    currentFragmentName = def.name.value;
                },
                leave: () => {
                    currentFragmentName = null;
                },
            },
            [graphql_1.Kind.VARIABLE]: () => {
                if (currentFragmentName) {
                    fragmentsWithVariables.add(currentFragmentName);
                }
            },
        };
    },
    prefixVariables: (prefix) => {
        return {
            [graphql_1.Kind.VARIABLE]: (variable) => prefixNodeName(variable, prefix),
        };
    },
    prefixFragmentNames: (prefix, fragmentNames) => {
        return {
            [graphql_1.Kind.FRAGMENT_DEFINITION]: (def) => fragmentNames.has(def.name.value) ? prefixNodeName(def, prefix) : def,
            [graphql_1.Kind.FRAGMENT_SPREAD]: (def) => fragmentNames.has(def.name.value) ? prefixNodeName(def, prefix) : def,
        };
    },
};
function prefixQueryParts(prefix, query) {
    let document = aliasTopLevelFields(prefix, query.query);
    const variableNames = Object.keys(query.variables);
    if (variableNames.length === 0) {
        return Object.assign(Object.assign({}, query), { query: document });
    }
    const fragmentsWithVariables = new Set();
    document = graphql_1.visit(document, graphql_1.visitInParallel([
        // Note: the sequence is important due to how visitInParallel deals with node edits
        Visitors.detectFragmentsWithVariables(fragmentsWithVariables),
        Visitors.prefixVariables(prefix),
    ]));
    if (fragmentsWithVariables.size > 0) {
        // Prefix all fragments and spreads having variables
        // Sadly, have to do another pass as fragment spreads may occur at any level
        // (fragments with variables are relatively rare though)
        const visitorKeyMap = {
            [graphql_1.Kind.DOCUMENT]: [`definitions`],
            [graphql_1.Kind.OPERATION_DEFINITION]: [`selectionSet`],
            [graphql_1.Kind.FRAGMENT_DEFINITION]: [`selectionSet`],
            [graphql_1.Kind.INLINE_FRAGMENT]: [`selectionSet`],
            [graphql_1.Kind.FIELD]: [`selectionSet`],
            [graphql_1.Kind.SELECTION_SET]: [`selections`],
        };
        document = graphql_1.visit(document, Visitors.prefixFragmentNames(prefix, fragmentsWithVariables), visitorKeyMap);
    }
    const prefixedVariables = variableNames.reduce((acc, name) => {
        acc[prefix + name] = query.variables[name];
        return acc;
    }, {});
    return {
        query: document,
        variables: prefixedVariables,
    };
}
/**
 * Adds prefixed aliases to top-level fields of the query.
 *
 * @see aliasFieldsInSelection for implementation details
 */
function aliasTopLevelFields(prefix, doc) {
    const transformer = {
        [graphql_1.Kind.OPERATION_DEFINITION]: (def) => {
            const { selections } = def.selectionSet;
            return Object.assign(Object.assign({}, def), { selectionSet: Object.assign(Object.assign({}, def.selectionSet), { selections: aliasFieldsInSelection(prefix, selections, doc) }) });
        },
    };
    const keyMap = { [graphql_1.Kind.DOCUMENT]: [`definitions`] };
    return graphql_1.visit(doc, transformer, keyMap);
}
/**
 * Add aliases to fields of the selection, including top-level fields of inline fragments.
 * Fragment spreads are converted to inline fragments and their top-level fields are also aliased.
 *
 * Note that this method is shallow. It adds aliases only to the top-level fields and doesn't
 * descend to field sub-selections.
 *
 * For example, transforms:
 *   {
 *     foo
 *     ... on Query { foo }
 *     ...FragmentWithBarField
 *   }
 * To:
 *   {
 *     gatsby1_foo: foo
 *     ... on Query { gatsby1_foo: foo }
 *     ... on Query { gatsby1_bar: bar }
 *   }
 */
function aliasFieldsInSelection(prefix, selections, document) {
    return selections.flatMap((selection) => {
        switch (selection.kind) {
            case graphql_1.Kind.INLINE_FRAGMENT:
                return [aliasFieldsInInlineFragment(prefix, selection, document)];
            case graphql_1.Kind.FRAGMENT_SPREAD: {
                const inlineFragment = inlineFragmentSpread(selection, document);
                return [
                    addSkipDirective(selection),
                    aliasFieldsInInlineFragment(prefix, inlineFragment, document),
                ];
            }
            case graphql_1.Kind.FIELD:
            default:
                return [aliasField(selection, prefix)];
        }
    });
}
function addSkipDirective(node) {
    const skipDirective = {
        kind: graphql_1.Kind.DIRECTIVE,
        name: { kind: graphql_1.Kind.NAME, value: `skip` },
        arguments: [
            {
                kind: graphql_1.Kind.ARGUMENT,
                name: { kind: graphql_1.Kind.NAME, value: `if` },
                value: { kind: graphql_1.Kind.BOOLEAN, value: true },
            },
        ],
    };
    return Object.assign(Object.assign({}, node), { directives: [skipDirective] });
}
/**
 * Add aliases to top-level fields of the inline fragment.
 * Returns new inline fragment node.
 *
 * For Example, transforms:
 *   ... on Query { foo, ... on Query { bar: foo } }
 * To
 *   ... on Query { gatsby1_foo: foo, ... on Query { gatsby1_bar: foo } }
 */
function aliasFieldsInInlineFragment(prefix, fragment, document) {
    const { selections } = fragment.selectionSet;
    return Object.assign(Object.assign({}, fragment), { selectionSet: Object.assign(Object.assign({}, fragment.selectionSet), { selections: aliasFieldsInSelection(prefix, selections, document) }) });
}
/**
 * Replaces fragment spread with inline fragment
 *
 * Example:
 *   query { ...Spread }
 *   fragment Spread on Query { bar }
 *
 * Transforms to:
 *   query { ... on Query { bar } }
 */
function inlineFragmentSpread(spread, document) {
    const fragment = document.definitions.find((def) => def.kind === graphql_1.Kind.FRAGMENT_DEFINITION && def.name.value === spread.name.value);
    if (!fragment) {
        throw new Error(`Fragment ${spread.name.value} does not exist`);
    }
    const { typeCondition, selectionSet } = fragment;
    return {
        kind: graphql_1.Kind.INLINE_FRAGMENT,
        typeCondition,
        selectionSet,
        directives: spread.directives,
    };
}
function prefixNodeName(namedNode, prefix) {
    return Object.assign(Object.assign({}, namedNode), { name: Object.assign(Object.assign({}, namedNode.name), { value: prefix + namedNode.name.value }) });
}
/**
 * Returns a new FieldNode with prefixed alias
 *
 * Example. Given prefix === "gatsby1_" transforms:
 *   { foo } -> { gatsby1_foo: foo }
 *   { foo: bar } -> { gatsby1_foo: bar }
 */
function aliasField(field, aliasPrefix) {
    const aliasNode = field.alias ? field.alias : field.name;
    return Object.assign(Object.assign({}, field), { alias: Object.assign(Object.assign({}, aliasNode), { value: aliasPrefix + aliasNode.value }) });
}
function isQueryDefinition(def) {
    return def.kind === graphql_1.Kind.OPERATION_DEFINITION && def.operation === `query`;
}
function isFragmentDefinition(def) {
    return def.kind === graphql_1.Kind.FRAGMENT_DEFINITION;
}
//# sourceMappingURL=merge-queries.js.map