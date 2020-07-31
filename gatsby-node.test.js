"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _apolloLinkHttp = require("apollo-link-http");

var _gatsbyNode = require("../gatsby-node");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

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
jest.mock('graphql', () => {
  const graphql = jest.requireActual('graphql');
  return { ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn()
  };
});

const getInternalGatsbyAPI = () => {
  const actions = {
    addThirdPartySchema: jest.fn(),
    createPageDependency: jest.fn(),
    createNode: jest.fn()
  };
  return {
    actions,
    cache: {
      get: jest.fn(),
      set: jest.fn()
    },
    createContentDigest: jest.fn(),
    createNodeId: jest.fn()
  };
};

const getPluginOptions = (options = {}) => {
  return options;
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
    await expect((0, _gatsbyNode.sourceNodes)(api, options)).rejects.toThrow('Missing TAKESHAPE_PROJECT environment variable.');
  });
  it('throws on missing token', async () => {
    delete process.env.TAKESHAPE_TOKEN;
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await expect((0, _gatsbyNode.sourceNodes)(api, options)).rejects.toThrow('Missing TAKESHAPE_TOKEN environment variable.');
  });
});
describe('createSchemaNode', () => {
  it('invokes createContentDigest', async () => {
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await (0, _gatsbyNode.sourceNodes)(api, options);
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
    await (0, _gatsbyNode.sourceNodes)(api, options);
    expect(_apolloLinkHttp.createHttpLink).toHaveBeenCalledWith(expect.objectContaining({
      fetch: mockFetch
    }));
  });
  it('use default fetch if not provided', async () => {
    const api = getInternalGatsbyAPI();
    const options = getPluginOptions();
    await (0, _gatsbyNode.sourceNodes)(api, options);
    expect(_apolloLinkHttp.createHttpLink).toHaveBeenCalledWith(expect.objectContaining({
      fetch: _nodeFetch.default
    }));
  });
});