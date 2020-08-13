import nodeFetch, {Response, RequestInfo, RequestInit} from 'node-fetch'
import {backoff, getRateLimitedFetch, getRateLimit, _sleeperId} from '../rate-limiting'
import pThrottle from 'p-throttle'
import sleep from '../../utils/sleep'
import {Fetch} from '../../types/fetch'

jest.mock(`node-fetch`)
jest.mock(`p-throttle`)
jest.mock(`../../utils/sleep`)

describe(`backoff`, () => {
  afterEach(() => {
    jest.spyOn(global.Math, `random`).mockRestore()
  })

  it(`is correct with a low random number`, async () => {
    jest.spyOn(global.Math, `random`).mockReturnValue(0)
    expect(backoff(100)).toBe(100)
  })

  it(`is correct with an average random number`, async () => {
    jest.spyOn(global.Math, `random`).mockReturnValue(0.5)
    expect(backoff(100)).toBe(200)
  })

  it(`is correct with a high random number`, async () => {
    jest.spyOn(global.Math, `random`).mockReturnValue(1)
    expect(backoff(100)).toBe(300)
  })

  it(`does not allow lastSleep below backoffCap`, async () => {
    jest.spyOn(global.Math, `random`).mockReturnValue(1)
    expect(() => backoff(99)).toThrow(`lastSleep should not be below backoffBase`)
  })
})

function getResponse(overrides: Record<string, unknown> = {}): Response {
  return ({
    status: 200,
    headers: {
      get: (header: string): string | null => {
        if (header === `x-ratelimit-limit`) {
          return `10`
        } else {
          return null
        }
      },
    },
    ...overrides,
  } as unknown) as Response
}

describe(`getRateLimitedFetch`, () => {
  beforeEach(() => {
    ;((sleep as unknown) as jest.Mock).mockImplementation(async () => null)
  })

  afterEach(() => {
    ;((nodeFetch as unknown) as jest.Mock).mockReset()
    ;((sleep as unknown) as jest.Mock).mockReset()
    jest.spyOn(global.Math, `random`).mockRestore()
  })

  it(`passes through the response in normal circumstances`, async () => {
    const response = getResponse()
    ;((nodeFetch as unknown) as jest.Mock).mockReturnValue(Promise.resolve(response))

    const rateLimitedFetch = getRateLimitedFetch(false)
    const requestInfo = ({} as unknown) as RequestInfo
    const requestInit = ({} as unknown) as RequestInit
    const result = await rateLimitedFetch(requestInfo, requestInit)
    expect(result).toBe(response)
  })

  it(`throttles if enabled`, async () => {
    const repetitions = 50
    let throttledFetch
    ;((pThrottle as unknown) as jest.Mock).mockImplementation(
      (fetch: Fetch) =>
        (throttledFetch = jest
          .fn()
          .mockImplementation((requestInfo: RequestInfo, requestInit: RequestInit) =>
            fetch(requestInfo, requestInit),
          )),
    )

    const response = getResponse()
    ;((nodeFetch as unknown) as jest.Mock).mockReturnValue(Promise.resolve(response))

    const rateLimitedFetch = getRateLimitedFetch(true)
    const requestInfo = ({} as unknown) as RequestInfo
    const requestInit = ({} as unknown) as RequestInit

    for (let i = 0; i < repetitions; i++) {
      const result = await rateLimitedFetch(requestInfo, requestInit)
      expect(result).toBe(response)
    }

    expect(pThrottle).toHaveBeenCalledWith(nodeFetch, 10, 1000)
    expect(pThrottle).toHaveBeenCalledTimes(1)

    // First one is not throttled since we haven't seen response headers yet, so
    // throttledFetch will be called n - 1 times where n is the number of fetches
    expect(throttledFetch).toHaveBeenCalledTimes(repetitions - 1)

    expect(nodeFetch).toHaveBeenCalledTimes(repetitions)
  })

  it(`backs off on 429`, async () => {
    const finalResponse = getResponse()
    let numberOf429s = 3
    ;((nodeFetch as unknown) as jest.Mock).mockImplementation(() => {
      if (numberOf429s > 0) {
        numberOf429s--
        return Promise.resolve(
          getResponse({
            status: 429,
          }),
        )
      } else {
        return Promise.resolve(finalResponse)
      }
    })

    const rateLimitedFetch = getRateLimitedFetch(false)
    const requestInfo = ({} as unknown) as RequestInfo
    const requestInit = ({} as unknown) as RequestInit
    const result = await rateLimitedFetch(requestInfo, requestInit)

    expect(result).toBe(finalResponse)
    expect(sleep).toHaveBeenCalledTimes(3)
  })

  it(`doesn't fetch when one is backed off`, async () => {
    let sleeps = 50
    ;((nodeFetch as unknown) as jest.Mock).mockImplementation(() => {
      return Promise.resolve(getResponse())
    })
    ;((sleep as unknown) as jest.Mock).mockImplementation(async () => {
      expect(nodeFetch).toHaveBeenCalledTimes(0)
      if (--sleeps < 1) {
        _sleeperId(null)
      }
    })

    _sleeperId(99999)

    const rateLimitedFetch = getRateLimitedFetch(false)
    const requestInfo = ({} as unknown) as RequestInfo
    const requestInit = ({} as unknown) as RequestInit
    const response = await rateLimitedFetch(requestInfo, requestInit)

    expect(response.status).toBe(200)
    expect(sleep).toHaveBeenCalledTimes(50)
    expect(nodeFetch).toHaveBeenCalledTimes(1)
  })
})

describe(`getRateLimit`, () => {
  it(`can get the rate limit from the header`, () => {
    const response = getResponse()
    expect(getRateLimit(response)).toBe(10)
  })

  it(`has a default if the header is not found`, () => {
    const response = getResponse()
    response.headers.get = () => null
    expect(getRateLimit(response)).toBe(5)
  })
})
