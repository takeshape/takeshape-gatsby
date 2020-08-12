import fetch, {RequestInit} from 'node-fetch'
import {ApiConfig} from '../types/takeshape'
import {HTTPError} from '../errors'

export default async function api<T = any>(
  params: ApiConfig,
  method: string,
  path: string,
  body?: any,
): Promise<T> {
  const requestParams: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${params.authToken}`,
      'Content-Type': `application/json`,
    },
  }

  if (body) {
    requestParams.body = JSON.stringify(body)
  }

  const endpoint = `${params.endpoint}${path}`

  const res = await fetch(endpoint, requestParams)
  if (res.ok) {
    return res.json()
  }

  throw new HTTPError(`${res.statusText}`, res.status)
}
