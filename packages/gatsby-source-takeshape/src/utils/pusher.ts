import Pusher, {AuthorizerGenerator, AuthorizerCallback} from 'pusher-js'
import fetch, {Headers, Response} from 'node-fetch'
import {URLSearchParams} from 'url'
import {Reporter} from 'gatsby'
import {PluginOptions} from '../types/takeshape'
import {ActionPayload, ActionContentTypes} from '../types/pusher'
import api from './takeshape-api'
import {tmpl} from './strings'
import {AuthData} from 'pusher-js/types/src/core/auth/options'

const createAuthEndpoint = tmpl<[string, string]>(`%s/project/%s/channel-auth`)

export function handleAction(
  reporter: Reporter,
  callback: (action: ActionPayload) => void,
): (action: ActionPayload) => void {
  return (action) => {
    if (
      action.type === ActionContentTypes.Updated ||
      action.type === ActionContentTypes.Created ||
      action.type === ActionContentTypes.Deleted
    ) {
      reporter.info(`[takeshape] Content updated`)
      callback(action)
    }
  }
}

const authorizer: AuthorizerGenerator = (channel, options) => {
  return {
    authorize: (socketId: string, callback: AuthorizerCallback) => {
      if (!options.auth) {
        throw new Error(`missing auth params`)
      }

      const {
        params: {authUrl},
        headers,
      } = options.auth

      const params = new URLSearchParams()
      params.append(`channel_name`, channel.name)
      params.append(`socket_id`, socketId)
      fetch(authUrl, {
        body: params,
        method: `POST`,
        headers: new Headers({
          'Content-Type': `application/x-www-form-url-encoded`,
          Accept: `application/json`,
          ...headers,
        }),
      })
        .then((res: Response) => {
          if (!res.ok) {
            throw new Error(`Received ${res.status} from ${authUrl}`)
          }
          return res.json()
        })
        .then((data: AuthData) => {
          callback(null, data)
        })
        .catch((err) => {
          callback(new Error(`Error calling auth endpoint: ${err}`), {
            auth: ``,
          })
        })
    },
  }
}

export async function subscribe(
  {apiKey, apiUrl, projectId}: Pick<PluginOptions, 'apiKey' | 'apiUrl' | 'projectId'>,
  reporter: Reporter,
  callback: (payload?: ActionPayload) => void,
): Promise<void> {
  const apiConfig = {
    authToken: apiKey,
    endpoint: apiUrl,
  }

  const config = await api<{key: string; cluster: string}>(
    apiConfig,
    `GET`,
    `/project/${projectId}/pusher-client-config`,
  )

  const pusher = new Pusher(config.key, {
    auth: {
      params: {
        authUrl: createAuthEndpoint(apiUrl, projectId),
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
    authorizer,
    cluster: config.cluster,
  })

  // Connection states: https://github.com/pusher/pusher-js#connection-states
  pusher.connection.bind(`connecting`, () => {
    reporter.info(`[takeshape] Update channel connecting...`)
  })

  pusher.connection.bind(`connected`, () => {
    reporter.info(`[takeshape] Update channel connected`)
  })

  pusher.connection.bind(`unavailable`, () => {
    reporter.error(
      `[takeshape] Update channel unavailable, your internet connection may have been lost`,
    )
  })

  const channel = pusher.subscribe(`presence-project.${projectId}`)

  channel.bind(`server-action`, handleAction(reporter, callback))
}
