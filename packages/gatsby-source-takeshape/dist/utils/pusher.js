"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = exports.handleAction = void 0;
const pusher_js_1 = __importDefault(require("pusher-js"));
const node_fetch_1 = __importStar(require("node-fetch"));
const url_1 = require("url");
const pusher_1 = require("../types/pusher");
const takeshape_api_1 = __importDefault(require("./takeshape-api"));
const strings_1 = require("./strings");
const createAuthEndpoint = strings_1.tmpl(`%s/project/%s/channel-auth`);
function handleAction(reporter, callback) {
    return (action) => {
        if (action.type === pusher_1.ActionContentTypes.Updated ||
            action.type === pusher_1.ActionContentTypes.Created ||
            action.type === pusher_1.ActionContentTypes.Deleted) {
            reporter.info(`[takeshape] Content updated`);
            callback(action);
        }
    };
}
exports.handleAction = handleAction;
const authorizer = (channel, options) => {
    return {
        authorize: (socketId, callback) => {
            if (!options.auth) {
                throw new Error(`missing auth params`);
            }
            const { params: { authUrl }, headers, } = options.auth;
            const params = new url_1.URLSearchParams();
            params.append(`channel_name`, channel.name);
            params.append(`socket_id`, socketId);
            node_fetch_1.default(authUrl, {
                body: params,
                method: `POST`,
                headers: new node_fetch_1.Headers({
                    'Content-Type': `application/x-www-form-url-encoded`,
                    Accept: `application/json`,
                    ...headers,
                }),
            })
                .then((res) => {
                if (!res.ok) {
                    throw new Error(`Received ${res.status} from ${authUrl}`);
                }
                return res.json();
            })
                .then((data) => {
                callback(null, data);
            })
                .catch((err) => {
                callback(new Error(`Error calling auth endpoint: ${err}`), {
                    auth: ``,
                });
            });
        },
    };
};
async function subscribe({ apiKey, apiUrl, projectId }, reporter, callback) {
    const apiConfig = {
        authToken: apiKey,
        endpoint: apiUrl,
    };
    const config = await takeshape_api_1.default(apiConfig, `GET`, `/project/${projectId}/pusher-client-config`);
    const pusher = new pusher_js_1.default(config.key, {
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
    });
    // Connection states: https://github.com/pusher/pusher-js#connection-states
    pusher.connection.bind(`connecting`, () => {
        reporter.info(`[takeshape] Update channel connecting...`);
    });
    pusher.connection.bind(`connected`, () => {
        reporter.info(`[takeshape] Update channel connected`);
    });
    pusher.connection.bind(`unavailable`, () => {
        reporter.error(`[takeshape] Update channel unavailable, your internet connection may have been lost`);
    });
    const channel = pusher.subscribe(`presence-project.${projectId}`);
    channel.bind(`server-action`, handleAction(reporter, callback));
}
exports.subscribe = subscribe;
//# sourceMappingURL=pusher.js.map