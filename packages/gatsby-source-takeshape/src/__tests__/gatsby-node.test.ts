jest.mock('@graphql-tools/wrap', () => {
  return {
    wrapSchema: jest.fn(),
    introspectSchema: jest.fn(),
    RenameTypes: jest.fn()
  };
});
jest.mock('apollo-link-http', () => {
  return {
    createHttpLink: jest.fn()
  };
});
import {createHttpLink} from 'apollo-link-http';
jest.mock('gatsby/graphql', () => {
  const graphql = jest.requireActual('gatsby/graphql');
  return {
    ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn()
  };
});
import {sourceNodes} from '../gatsby-node';
import nodeFetch from 'node-fetch';
import {SourceNodesArgs, Actions, PluginOptions} from 'gatsby';

const getInternalGatsbyAPI = () => {
  const actions = ({
    addThirdPartySchema: jest.fn(),
    createPageDependency: jest.fn(),
    createNode: jest.fn()
  } as unknown) as Actions;

  return ({
    actions,
    cache: {
      get: jest.fn(),
      set: jest.fn()
    },
    createContentDigest: jest.fn(),
    createNodeId: jest.fn()
  } as unknown) as SourceNodesArgs;
};

const getPluginOptions = (options = {}) => {
  return (options as unknown) as PluginOptions;
};

describe('validation', () => {
  let project;
  let token;
  beforeEach(() => {
    project = process.env.TAKESHAPE_PROJECT;
    token = process.env.TAKESHAPE_TOKEN;
  });
  afterEach(() => {
    process.env.TAKESHAPE_PROJECT = project;
    process.env.TAKESHAPE_TOKEN = token;
  });
  it('throws on missing project', async () => {
    delete process.env.TAKESHAPE_PROJECT;
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await expect(sourceNodes(api, options)).rejects.toThrow('Missing TAKESHAPE_PROJECT environment variable.');
  });
  it('throws on missing token', async () => {
    delete process.env.TAKESHAPE_TOKEN;
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await expect(sourceNodes(api, options)).rejects.toThrow('Missing TAKESHAPE_TOKEN environment variable.');
  });
});

describe('createSchemaNode', () => {
  it('invokes createContentDigest', async () => {
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await sourceNodes(api, options);

    expect(api.createContentDigest).toHaveBeenCalledWith(expect.any(String));
    expect(api.createContentDigest).toHaveBeenCalledTimes(1);
  });
});

describe('createHttpLink', () => {
  it('use passed in fetch if provided', async () => {
    const api = getInternalGatsbyAPI();
    const mockFetch = jest.fn();
    const options = getPluginOptions({
      fetch: mockFetch
    });
    await sourceNodes(api, options);

    expect(createHttpLink).toHaveBeenCalledWith(expect.objectContaining({fetch: mockFetch}));
  });
  it('use default fetch if not provided', async () => {
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await sourceNodes(api, options);

    expect(createHttpLink).toHaveBeenCalledWith(expect.objectContaining({fetch: nodeFetch}));
  });
});
