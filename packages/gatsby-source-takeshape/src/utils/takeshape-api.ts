import fetch, {RequestInit} from 'node-fetch'
import {ApiConfig} from '../types/takeshape'
import {HTTPError} from '../errors'

function isValidHeader(str: string): boolean {
  const json = Buffer.from(str, `base64`).toString(`utf8`)
  try {
    const header = JSON.parse(json)
    return header.typ === `JWT`
  } catch (e) {
    return false
  }
}

export function isJWT(str: string): boolean {
  const parts = str.split(`.`)
  return parts.length === 3 && isValidHeader(parts[0])
}

export function getAuthHeader(authToken?: string): {[name: string]: string} {
  if (!authToken) {
    return {}
  }

  return isJWT(authToken)
    ? {'X-TakeShape-Token': authToken}
    : {Authorization: `Bearer ${authToken}`}
}

export default async function api<T = any>(
  params: ApiConfig,
  method: string,
  path: string,
  body?: any,
): Promise<T> {
  const requestParams: RequestInit = {
    method,
    headers: {
      ...getAuthHeader(params.authToken),
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
