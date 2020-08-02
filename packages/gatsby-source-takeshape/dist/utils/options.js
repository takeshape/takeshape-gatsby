"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
const authTokenPattern = /[0-9a-z]{32}/;
const projecIdPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
exports.withDefaults = (_a) => {
    var { authToken, projectId } = _a, options = __rest(_a, ["authToken", "projectId"]);
    assert_1.default(typeof authToken === `string` && authToken, `[takeshape] \`authToken\` must be specified`);
    assert_1.default(authTokenPattern.test(authToken), `[takeshape] \`authToken\` is invalid`);
    assert_1.default(typeof projectId === `string` && projectId, `[takeshape] \`projectId\` must be specified`);
    assert_1.default(projecIdPattern.test(projectId), `[takeshape] \`projectId\` is invalid`);
    return Object.assign(Object.assign({ authToken,
        projectId }, defaultOptions), options);
};
//# sourceMappingURL=options.js.map