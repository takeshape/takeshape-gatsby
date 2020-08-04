import nodeFetch, {Response, RequestInfo, RequestInit} from 'node-fetch'
import pThrottle from 'p-throttle'
import sleep from '../utils/sleep'
import {Fetch} from '../types/fetch'

let rateLimit: number | null = null
const defaultRateLimit = 5
const rateLimitPeriod = 1000
const backoffBase = 100
const backoffCap = 10000

// Get a throttled fetch based on a rate limit in requests per second
const getThrottledFetch = (rateLimit: number): Fetch => {
  return pThrottle(nodeFetch, rateLimit, rateLimitPeriod)
}

let fetch: Fetch = nodeFetch

function randomBetween(x: number, y: number) {
  return x + Math.random() * (y - x)
}

// Backoff with decorrelated jitter
// https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
export function backoff(lastSleep: number): number {
  if (lastSleep < backoffBase) {
    throw new Error(`lastSleep should not be below backoffBase`)
  }
  return Math.min(backoffCap, randomBetween(backoffBase, lastSleep * 3))
}

let requestCount = 0
let sleeperId: null | number = null

// For tests only
export const _sleeperId = (id: number | null): void => {
  sleeperId = id
}

export const getRateLimitedFetch = (throttle: boolean): Fetch => {
  return (requestInfo: RequestInfo, requestInit: RequestInit): Promise<Response> => {
    return rateLimitedFetch(requestInfo, requestInit, throttle)
  }
}

export const getRateLimit = (response: Response): number => {
  const rateLimitHeader = response.headers.get(`x-ratelimit-limit`)
  return rateLimitHeader === null ? defaultRateLimit : +rateLimitHeader
}

// Fetch wrapper and will use exponential backoff on 429 errors and will optionally throttle
// based on the rate limit response header
const rateLimitedFetch = async (
  requestInfo: RequestInfo,
  requestInit: RequestInit,
  throttle?: boolean,
  lastSleep?: number,
  requestId?: number,
): Promise<Response> => {
  if (requestId === undefined) {
    requestId = requestCount++
  }

  // Don't start a new query if we're currently backing off.
  // Jitter so waiting queries don't all start at the same time.
  while (sleeperId !== null && sleeperId !== requestId) {
    await sleep(randomBetween(backoffBase, backoffBase * 3))
  }

  const response = await fetch(requestInfo, requestInit)

  // Respond to 429 by backing off and trying again.
  if (response.status === 429) {
    lastSleep = lastSleep || backoffBase
    const napLength = backoff(lastSleep)
    sleeperId = requestId
    await sleep(napLength)
    return await rateLimitedFetch(requestInfo, requestInit, throttle, napLength, requestId)
  }

  // If enabled, rate limit future queries based on response header
  // after the first one.
  if (throttle && fetch === nodeFetch) {
    rateLimit = getRateLimit(response)
    fetch = getThrottledFetch(rateLimit)
  }

  sleeperId = null
  return Promise.resolve(response)
}
