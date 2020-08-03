"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataloaderLink = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const apollo_link_1 = require("apollo-link");
const merge_queries_1 = require("./merge-queries");
const requests_1 = require("../utils/requests");
function createDataloaderLink(options) {
    const load = async (keys) => {
        const result = await requests_1.graphQLRequest(merge_queries_1.merge(keys), options);
        if (result.success === false) {
            const error = new Error(`Failed to load query batch:\n${requests_1.formatErrors(result)}`);
            error.name = `GraphQLError`;
            throw error;
        }
        return merge_queries_1.resolveResult(result);
    };
    const { queryConcurrency } = options;
    const maxBatchSize = Math.min(4, Math.round(queryConcurrency / 5));
    const dataloader = new dataloader_1.default(load, {
        cache: false,
        maxBatchSize,
        batchScheduleFn: (cb) => setTimeout(cb, 50),
        ...options.dataLoaderOptions,
    });
    return new apollo_link_1.ApolloLink((operation) => new apollo_link_1.Observable((observer) => {
        const { query, variables } = operation;
        dataloader
            .load({ query, variables })
            // TODO: properly type this
            .then((response) => {
            operation.setContext({ response });
            observer.next(response);
            observer.complete();
            return response;
        })
            .catch((err) => {
            if (err.name === `AbortError`) {
                return;
            }
            observer.error(err);
        });
    }));
}
exports.createDataloaderLink = createDataloaderLink;
//# sourceMappingURL=dataloader-link.js.map