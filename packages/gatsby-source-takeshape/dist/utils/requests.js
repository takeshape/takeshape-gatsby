"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrors = exports.graphQLRequest = void 0;
const graphql_1 = require("graphql");
async function graphQLRequest(query, options) {
    const { uri, fetch, fetchOptions, headers } = options;
    try {
        const body = JSON.stringify({
            query: graphql_1.print(query.query),
            variables: query.variables,
        });
        const response = await fetch(uri, Object.assign(Object.assign({ method: `POST` }, fetchOptions), { headers: Object.assign(Object.assign({}, headers), { 'Content-Type': `application/json` }), body }));
        const data = await response.json();
        return { data };
    }
    catch (err) {
        return {
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