"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthHeader = exports.isJWT = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const errors_1 = require("../errors");
function isValidHeader(str) {
    const json = Buffer.from(str, `base64`).toString(`utf8`);
    try {
        const header = JSON.parse(json);
        return header.typ === `JWT`;
    }
    catch (e) {
        return false;
    }
}
function isJWT(str) {
    const parts = str.split(`.`);
    return parts.length === 3 && isValidHeader(parts[0]);
}
exports.isJWT = isJWT;
function getAuthHeader(authToken) {
    if (!authToken) {
        return {};
    }
    return isJWT(authToken)
        ? { 'X-TakeShape-Token': authToken }
        : { Authorization: `Bearer ${authToken}` };
}
exports.getAuthHeader = getAuthHeader;
async function api(params, method, path, body) {
    const requestParams = {
        method,
        headers: {
            ...getAuthHeader(params.authToken),
            'Content-Type': `application/json`,
        },
    };
    if (body) {
        requestParams.body = JSON.stringify(body);
    }
    const endpoint = `${params.endpoint}${path}`;
    const res = await node_fetch_1.default(endpoint, requestParams);
    if (res.ok) {
        return res.json();
    }
    throw new errors_1.HTTPError(`${res.statusText}`, res.status);
}
exports.default = api;
//# sourceMappingURL=takeshape-api.js.map