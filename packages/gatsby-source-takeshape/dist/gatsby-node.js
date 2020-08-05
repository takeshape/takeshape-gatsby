"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceNodes = void 0;
const uuid_1 = require("uuid");
const graphql_1 = require("gatsby/graphql");
const links_1 = require("@graphql-tools/links");
const wrap_1 = require("@graphql-tools/wrap");
const apollo_link_http_1 = require("apollo-link-http");
const node_fetch_1 = __importDefault(require("node-fetch"));
const gatsby_core_utils_1 = require("gatsby-core-utils");
const transforms_1 = require("./transforms");
const dataloader_link_1 = require("./batching/dataloader-link");
const options_1 = require("./options");
const pusher_1 = require("./utils/pusher");
const strings_1 = require("./utils/strings");
const isDevelopMode = process.env.gatsby_executing_command === `develop`;
const typeName = `TS`;
const fieldName = `takeshape`;
const nodeType = `TakeShapeSource`;
const createUri = strings_1.tmpl(`%s/project/%s/graphql`);
const createCacheKey = strings_1.tmpl(`gatsby-source-takeshape-schema-%s-%s`);
const createSourceNodeId = strings_1.tmpl(`gatsby-source-takeshape-%s`);
exports.sourceNodes = async ({ actions, createNodeId, cache, reporter }, options = {}) => {
    const { createNode, addThirdPartySchema } = actions;
    const config = options_1.withDefaults(options);
    const { apiKey, apiUrl, batch, projectId, fetchOptions, dataLoaderOptions, queryConcurrency, } = config;
    const uri = createUri(apiUrl, projectId);
    const headers = {
        'Content-Type': `application/json`,
        Authorization: `Bearer ${apiKey}`,
    };
    let link;
    if (batch) {
        reporter.info(`[takeshape] Using DataLoader`);
        link = dataloader_link_1.createDataloaderLink({
            uri,
            fetchOptions,
            headers,
            dataLoaderOptions,
            queryConcurrency,
        });
    }
    else {
        link = apollo_link_http_1.createHttpLink({
            uri,
            fetch: node_fetch_1.default,
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
    // Only need to subscribe to updates in develop mode
    if (isDevelopMode) {
        pusher_1.subscribe(config, () => {
            reporter.info(`[takeshape] Content updated`);
            createNode(createSchemaNode({
                id: nodeId,
                typeName,
                fieldName,
            }));
        });
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