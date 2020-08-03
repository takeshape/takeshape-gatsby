import fetchMock, {enableFetchMocks} from 'jest-fetch-mock'
enableFetchMocks()

import {parse} from 'graphql'
import {execute} from 'apollo-link'
import {createDataloaderLink} from '../dataloader-link'
import nodeFetch, {Response} from 'node-fetch'

const sampleQuery = parse(`{ foo }`)
const expectedSampleQueryResult = {data: {foo: `bar`}}
const fetchResult = ({data: {gatsby0_foo: `bar`}} as unknown) as Response

describe(`createDataloaderLink`, () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it(`works with minimal set of options`, (done) => {
    const link = createDataloaderLink({
      uri: `http://localhost`,
      fetch: nodeFetch,
      fetchOptions: {},
      dataLoaderOptions: {},
      headers: {},
      queryConcurrency: 4,
    })
    fetchMock.mockResponse(JSON.stringify(fetchResult))
    const observable = execute(link, {query: sampleQuery})
    observable.subscribe({
      next: (result) => {
        expect(result).toEqual(expectedSampleQueryResult)
        done()
      },
      error: done,
    })
  })

  it(`reports fetch errors`, (done) => {
    const link = createDataloaderLink({
      uri: `http://localhost`,
      fetch: nodeFetch,
      fetchOptions: {},
      dataLoaderOptions: {},
      headers: {},
      queryConcurrency: 4,
    })
    fetchMock.mockReject(new Error(`FetchError`))
    const observable = execute(link, {query: sampleQuery})
    observable.subscribe({
      error: (error) => {
        expect(error.message).toMatch(/FetchError/)
        done()
      },
      complete: () => {
        done.fail(`Expected error not thrown`)
      },
    })
  })

  it(`reports graphql errors`, (done) => {
    const result = ({
      errors: [{message: `Error1`}, {message: `Error2`}],
    } as unknown) as Response

    const link = createDataloaderLink({
      uri: `http://localhost`,
      fetch: nodeFetch,
      fetchOptions: {},
      dataLoaderOptions: {},
      headers: {},
      queryConcurrency: 4,
    })
    fetchMock.mockResponse(JSON.stringify(result))
    const observable = execute(link, {query: sampleQuery})
    observable.subscribe({
      error: (error) => {
        expect(error.name).toEqual(`GraphQLError`)
        expect(error.message).toEqual(`Failed to load query batch:\nError1\nError2`)
        done()
      },
      complete: () => {
        done.fail(`Expected error not thrown`)
      },
    })
  })
})
