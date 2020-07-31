"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sourceNodes = void 0;

var _uuid = require("uuid");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _graphql = require("gatsby/graphql");

var _apolloLinkHttp = require("apollo-link-http");

var _links = require("@graphql-tools/links");

var _wrap = require("@graphql-tools/wrap");

var _transforms = require("./transforms");

var _dataloaderLink = require("./batching/dataloader-link");

const sourceNodes = async ({
  actions,
  createNodeId,
  cache,
  createContentDigest
}, options) => {
  const {
    refetchInterval,
    batch = false,
    fetch = _nodeFetch.default,
    fetchOptions = {},
    dataLoaderOptions = {}
  } = options;
  const {
    createNode,
    addThirdPartySchema
  } = actions;
  const project = process.env.TAKESHAPE_PROJECT;
  const token = process.env.TAKESHAPE_TOKEN;

  if (project === undefined) {
    throw new Error('Missing TAKESHAPE_PROJECT environment variable.');
  }

  if (token === undefined) {
    throw new Error('Missing TAKESHAPE_TOKEN environment variable.');
  }

  const uri = `https://api.takeshape.io/project/${project}/graphql`;
  const typeName = 'TS';
  const fieldName = 'takeshape';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  let link;

  if (batch) {
    link = (0, _dataloaderLink.createDataloaderLink)({
      uri,
      fetch,
      fetchOptions,
      headers,
      dataLoaderOptions
    });
  } else {
    link = (0, _apolloLinkHttp.createHttpLink)({
      uri,
      fetch,
      fetchOptions,
      headers
    });
  }

  let introspectionSchema;
  const cacheKey = `gatsby-source-takeshape-schema-${typeName}-${fieldName}`;
  let sdl = await cache.get(cacheKey);

  if (!sdl) {
    introspectionSchema = await (0, _wrap.introspectSchema)((0, _links.linkToExecutor)(link));
    sdl = (0, _graphql.printSchema)(introspectionSchema);
  } else {
    introspectionSchema = (0, _graphql.buildSchema)(sdl);
  }

  await cache.set(cacheKey, sdl);
  const nodeId = createNodeId(`gatsby-source-takeshape-${typeName}`);
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
    createContentDigest
  });
  createNode(node);

  const resolver = (parent, args, context) => {
    context.nodeModel.createPageDependency({
      path: context.path,
      nodeId: nodeId
    });
    return {};
  };

  const schema = (0, _wrap.wrapSchema)({
    schema: introspectionSchema,
    executor: (0, _links.linkToExecutor)(link)
  }, [new _transforms.StripNonQueryTransform(), new _wrap.RenameTypes(name => `${typeName}_${name}`), new _transforms.NamespaceUnderFieldTransform({
    typeName,
    fieldName,
    resolver
  })]);
  addThirdPartySchema({
    schema
  });

  if (process.env.NODE_ENV !== 'production') {
    if (refetchInterval) {
      const msRefetchInterval = refetchInterval * 1000;

      const refetcher = () => {
        createNode(createSchemaNode({
          id: nodeId,
          typeName,
          fieldName,
          createContentDigest
        }));
        setTimeout(refetcher, msRefetchInterval);
      };

      setTimeout(refetcher, msRefetchInterval);
    }
  }
};

exports.sourceNodes = sourceNodes;

function createSchemaNode({
  id,
  typeName,
  fieldName,
  createContentDigest
}) {
  const nodeContent = (0, _uuid.v4)();
  const nodeContentDigest = createContentDigest(nodeContent);
  return {
    id,
    typeName: typeName,
    fieldName: fieldName,
    parent: null,
    children: [],
    internal: {
      type: 'TakeShapeSource',
      contentDigest: nodeContentDigest,
      ignoreType: true
    }
  };
}