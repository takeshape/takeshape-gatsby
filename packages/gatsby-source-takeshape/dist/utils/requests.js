"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrors = exports.graphQLRequest = void 0;
const graphql_1 = require("gatsby/graphql");
const node_fetch_1 = __importDefault(require("node-fetch"));
async function graphQLRequest(query, options) {
    const { uri, fetchOptions, headers } = options;
    try {
        const body = JSON.stringify({
            query: graphql_1.print(query.query),
            variables: query.variables,
        });
        const response = await node_fetch_1.default(uri, {
            method: `POST`,
            ...fetchOptions,
            headers: {
                ...headers,
                'Content-Type': `application/json`,
            },
            body,
        });
        const responseJson = await response.json();
        if (responseJson.errors) {
            return {
                success: false,
                ...responseJson,
            };
        }
        return {
            success: true,
            ...responseJson,
        };
    }
    catch (err) {
        return {
            success: false,
            errors: [{ message: err.message, type: `GraphQL request failed` }],
        };
    }
}
exports.graphQLRequest = graphQLRequest;
function formatErrors(result) {
    if (result.errors) {
        return result.errors.map((error) => error.message).join(`\n`);
    }
    return `Unexpected GraphQL result`;
}
exports.formatErrors = formatErrors;
//# sourceMappingURL=requests.js.map