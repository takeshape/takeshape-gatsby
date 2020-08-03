import {createHttpLink} from 'apollo-link-http'
import nodeFetch from 'node-fetch'
import {PluginOptions} from '../index'
import {sourceNodes as _sourceNodes} from '../gatsby-node'

const projectId = `00000000-0000-0000-0000-000000000000`
const apiKey = `00000000000000000000000000000000`

jest.mock(`@graphql-tools/wrap`, () => {
  return {
    wrapSchema: jest.fn(),
    introspectSchema: jest.fn(),
    RenameTypes: jest.fn(),
  }
})

jest.mock(`apollo-link-http`, () => {
  return {
    createHttpLink: jest.fn(),
  }
})

jest.mock(`graphql`, () => {
  const graphql = jest.requireActual(`graphql`)
  return {
    ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn(),
  }
})

const actions = {
  addThirdPartySchema: jest.fn(),
  createNode: jest.fn(),
}

const reporter = {
  info: jest.fn((message: string): string => message),
  warn: jest.fn((message: string): string => message),
  panic: jest.fn((message: string): string => message),
}

const createNodeId = jest.fn()

const cache = {
  get: jest.fn(),
  set: jest.fn(),
}

interface SourceNodesArgs {
  actions: typeof actions
  cache: typeof cache
  createNodeId: typeof createNodeId
  reporter: typeof reporter
}

type OnSourceNodes = (args: SourceNodesArgs, options?: PluginOptions) => Promise<void>

const getInternalGatsbyAPI = () => {
  const sourceNodeArgs: SourceNodesArgs = {
    actions,
    cache,
    createNodeId,
    reporter,
  }

  return sourceNodeArgs
}

const getPluginOptions = (options = {}) => {
  options = {
    apiKey,
    projectId,
    ...options,
  }
  return (options as unknown) as PluginOptions
}

describe(`Options are handled correctly`, () => {
  const sourceNodes = (_sourceNodes as unknown) as OnSourceNodes

  describe(`Fails when needed options are not provided`, () => {
    it(`throws on missing projectId`, async () => {
      const args = getInternalGatsbyAPI()
      const options = getPluginOptions({
        projectId: null,
      })
      await expect(sourceNodes(args, options)).rejects.toThrow(
        `[takeshape] \`projectId\` must be specified`,
      )
    })

    it(`throws on missing apiKey`, async () => {
      const args = getInternalGatsbyAPI()
      const options = getPluginOptions({
        apiKey: null,
      })
      await expect(sourceNodes(args, options)).rejects.toThrow(
        `[takeshape] \`apiKey\` must be specified`,
      )
    })
  })

  describe(`createHttpLink`, () => {
    it(`use passed in fetch if provided`, async () => {
      const args = getInternalGatsbyAPI()
      const mockFetch = jest.fn()
      const options = getPluginOptions({
        fetch: mockFetch,
      })
      await sourceNodes(args, options)

      expect(createHttpLink).toHaveBeenCalledWith(expect.objectContaining({fetch: mockFetch}))
    })

    it(`use default fetch if not provided`, async () => {
      const api = getInternalGatsbyAPI()
      const options = getPluginOptions()
      await sourceNodes(api, options)

      expect(createHttpLink).toHaveBeenCalledWith(expect.objectContaining({fetch: nodeFetch}))
    })
  })
})
