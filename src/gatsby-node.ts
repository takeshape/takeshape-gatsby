import {v4 as uuidv4} from 'uuid';
import nodeFetch from 'node-fetch';
import {buildSchema, printSchema, GraphQLSchema} from 'graphql';
import {createHttpLink} from 'apollo-link-http';
import {linkToExecutor} from '@graphql-tools/links';
import {wrapSchema, introspectSchema, RenameTypes} from '@graphql-tools/wrap';
import {NamespaceUnderFieldTransform, StripNonQueryTransform} from './transforms';
import {createDataloaderLink} from './batching/dataloader-link';
import {ApolloLink} from 'apollo-link';
import {GatsbyNode} from 'gatsby';

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  {actions, createNodeId, cache, createContentDigest},
  options
): Promise<void> => {
  const {refetchInterval, batch = false, fetch = nodeFetch, fetchOptions = {}, dataLoaderOptions = {}} = options;
  const {createNode, addThirdPartySchema} = actions;
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

  let link: ApolloLink;
  if (batch) {
    link = createDataloaderLink({
      uri,
      fetch,
      fetchOptions,
      headers,
      dataLoaderOptions
    });
  } else {
    link = createHttpLink({
      uri,
      fetch,
      fetchOptions,
      headers
    });
  }

  let introspectionSchema: GraphQLSchema;

  const cacheKey = `gatsby-source-takeshape-schema-${typeName}-${fieldName}`;
  let sdl = await cache.get(cacheKey);

  if (!sdl) {
    introspectionSchema = await introspectSchema(linkToExecutor(link));
    sdl = printSchema(introspectionSchema);
  } else {
    introspectionSchema = buildSchema(sdl);
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

  const schema = wrapSchema(
    {
      schema: introspectionSchema,
      executor: linkToExecutor(link)
    },
    [
      new StripNonQueryTransform(),
      new RenameTypes((name) => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform({
        typeName,
        fieldName,
        resolver
      })
    ]
  );

  addThirdPartySchema({schema});

  if (process.env.NODE_ENV !== 'production') {
    if (refetchInterval) {
      const msRefetchInterval = refetchInterval * 1000;
      const refetcher = () => {
        createNode(
          createSchemaNode({
            id: nodeId,
            typeName,
            fieldName,
            createContentDigest
          })
        );
        setTimeout(refetcher, msRefetchInterval);
      };
      setTimeout(refetcher, msRefetchInterval);
    }
  }
};

function createSchemaNode({id, typeName, fieldName, createContentDigest}) {
  const nodeContent = uuidv4();
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
