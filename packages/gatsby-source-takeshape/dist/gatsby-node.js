"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceNodes = void 0;
const uuid_1 = require("uuid");
const graphql_1 = require("graphql");
const links_1 = require("@graphql-tools/links");
const wrap_1 = require("@graphql-tools/wrap");
const apollo_link_http_1 = require("apollo-link-http");
const gatsby_core_utils_1 = require("gatsby-core-utils");
const transforms_1 = require("./transforms");
const dataloader_link_1 = require("./batching/dataloader-link");
const options_1 = require("./utils/options");
const strings_1 = require("./utils/strings");
const isDevelopMode = process.env.gatsby_executing_command === `develop`;
const typeName = `TS`;
const fieldName = `takeshape`;
const nodeType = `TakeShapeSource`;
const createUri = strings_1.tmpl(`https://api.takeshape.io/project/%s/graphql`);
const createCacheKey = strings_1.tmpl(`gatsby-source-takeshape-schema-%s-%s`);
const createSourceNodeId = strings_1.tmpl(`gatsby-source-takeshape-%s`);
exports.sourceNodes = async ({ actions, createNodeId, cache, reporter }, options = {}) => {
    const { createNode, addThirdPartySchema } = actions;
    const { authToken, batch, projectId, fetch, fetchOptions, dataLoaderOptions, refetchInterval, queryConcurrency, } = options_1.withDefaults(options);
    const uri = createUri(projectId);
    const headers = {
        'Content-Type': `application/json`,
        Authorization: `Bearer ${authToken}`,
    };
    let link;
    if (batch) {
        reporter.info(`[takeshape] Using DataLoader`);
        link = dataloader_link_1.createDataloaderLink({
            uri,
            fetch,
            fetchOptions,
            headers,
            dataLoaderOptions,
            queryConcurrency,
        });
    }
    else {
        link = apollo_link_http_1.createHttpLink({
            uri,
            fetch,
            fetchOptions,
            headers,
        });
    }
    let introspectionSchema;
    const cacheKey = createCacheKey(typeName, fieldName);
    let sdl = await cache.get(cacheKey);
    const executor = links_1.linkToExecutor(link);
    reporter.info(`[takeshape] Fetching remote schema`);
    if (!sdl) {
        introspectionSchema = await wrap_1.introspectSchema(executor);
        sdl = graphql_1.printSchema(introspectionSchema);
    }
    else {
        introspectionSchema = graphql_1.buildSchema(sdl);
    }
    await cache.set(cacheKey, sdl);
    const nodeId = createNodeId(createSourceNodeId(typeName));
    const node = createSchemaNode({
        id: nodeId,
        typeName,
        fieldName,
    });
    createNode(node);
    const resolver = (_, __, context) => {
        context.nodeModel.createPageDependency({
            path: context.path || ``,
            nodeId,
        });
        return {};
    };
    const schema = wrap_1.wrapSchema({
        schema: introspectionSchema,
        executor,
    }, [
        new transforms_1.StripNonQueryTransform(),
        new wrap_1.RenameTypes((name) => `${typeName}_${name}`),
        new transforms_1.NamespaceUnderFieldTransform({
            typeName,
            fieldName,
            resolver,
        }),
    ]);
    addThirdPartySchema({ schema });
    // Refetching is only necessary when running a develop server
    if (isDevelopMode && refetchInterval > 0) {
        reporter.info(`[takeshape] Refetching schema every ${refetchInterval} seconds`);
        const msRefetchInterval = refetchInterval * 1000;
        const refetcher = () => {
            reporter.info(`[takeshape] Fetching latest nodes`);
            createNode(createSchemaNode({
                id: nodeId,
                typeName,
                fieldName,
            }));
            setTimeout(refetcher, msRefetchInterval);
        };
        setTimeout(refetcher, msRefetchInterval);
    }
};
function createSchemaNode({ id, typeName, fieldName, }) {
    return {
        id,
        typeName,
        fieldName,
        children: [],
        internal: {
            type: nodeType,
            contentDigest: gatsby_core_utils_1.createContentDigest(uuid_1.v4()),
        },
    };
}
//# sourceMappingURL=gatsby-node.js.map