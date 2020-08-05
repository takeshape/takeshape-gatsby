import Pusher, {AuthorizerGenerator} from 'pusher-js'
import fetch, {Headers} from 'node-fetch'
import {URLSearchParams} from 'url'
import {PluginOptions} from '../types/takeshape'
import api from './takeshape-api'
import {tmpl} from './strings'

const createAuthEndpoint = tmpl<[string, string]>(`%s/project/%s/channel-auth`)

// export function handleWarning(type: string, error: Record<string, unknown>): void {
//   if (type === `Error` && error.type === `WebSocketError`) {
//     console.log(`Disconnected from TakeShape. Restart this process to resume live content updates.`)
//   }
// }

// Pusher.warn = handleWarning

type Action = {
  type: string
  meta: {source: string}
  payload: {
    contentId: string
    contentTypeId: string
  }
}

export function handleAction(callback: (action: any) => void): (action: Action) => void {
  return (action) => {
    if (
      action.type === `content/CONTENT_UPDATED` ||
      action.type === `content/CONTENT_CREATED` ||
      action.type === `content/CONTENT_DELETED`
    ) {
      callback(action)
    }
  }
}

const authorizer: AuthorizerGenerator = (channel, options) => {
  return {
    authorize: (socketId: string, callback: any) => {
      if (!options.auth) {
        throw new Error(`missing auth params`)
      }

      const params = new URLSearchParams()
      params.append(`channel_name`, channel.name)
      params.append(`socket_id`, socketId)
      fetch(options.auth.params.authUrl, {
        body: params,
        method: `POST`,
        headers: new Headers({
          'Content-Type': `application/x-www-form-url-encoded`,
          Accept: `application/json`,
          ...options.auth?.headers,
        }),
      })
        .then((res: any) => {
          if (!res.ok) {
            throw new Error(`Received ${res.statusCode} from ${options.auth?.params.authUrl}`)
          }
          return res.json()
        })
        .then((data) => {
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
  {
    apiKey,
    apiUrl,
    appUrl,
    projectId,
  }: Pick<PluginOptions, 'appUrl' | 'apiKey' | 'apiUrl' | 'projectId'>,
  callback: (payload: any) => void,
): Promise<void> {
  const apiConfig = {
    authToken: apiKey,
    endpoint: apiUrl,
    appUrl,
  }

  const config = await api(apiConfig, `GET`, `/project/${projectId}/pusher-client-config`)

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
  // handle bad states: https://github.com/pusher/pusher-js#connection-states
  pusher.connection.bind(`error`, function (err) {
    if (err.error.data.code === 4004) {
      log(`Over limit!`)
    }
  })

  const channel = pusher.subscribe(`presence-project.${projectId}`)

  channel.bind(`server-action`, handleAction(callback))
}
