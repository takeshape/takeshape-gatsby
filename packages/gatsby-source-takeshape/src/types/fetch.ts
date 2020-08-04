import {Response, RequestInfo, RequestInit} from 'node-fetch'

export type Fetch = (info: RequestInfo, init: RequestInit) => Promise<Response>
