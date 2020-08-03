"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDefaults = void 0;
const assert_1 = __importDefault(require("assert"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const defaultOptions = {
    batch: false,
    dataLoaderOptions: {},
    fetch: node_fetch_1.default,
    fetchOptions: {},
    refetchInterval: 60,
    queryConcurrency: Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY || `4`),
};
// TODO: are there other valid patterns?
const apiKeyPattern = /[0-9a-z]{32}/;
const projecIdPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
exports.withDefaults = ({ apiKey, projectId, ...options }) => {
    assert_1.default(typeof apiKey === `string` && apiKey, `[takeshape] \`apiKey\` must be specified`);
    assert_1.default(apiKeyPattern.test(apiKey), `[takeshape] \`apiKey\` is invalid`);
    assert_1.default(typeof projectId === `string` && projectId, `[takeshape] \`projectId\` must be specified`);
    assert_1.default(projecIdPattern.test(projectId), `[takeshape] \`projectId\` is invalid`);
    return {
        apiKey,
        projectId,
        ...defaultOptions,
        ...options,
    };
};
//# sourceMappingURL=options.js.map