import { PluginOptions as GatsbyPluginOptions } from 'gatsby';
import nodeFetch, { RequestInit } from 'node-fetch';
import { Options as DataLoaderOptions } from 'dataloader';
export interface PluginOptions extends Omit<GatsbyPluginOptions, 'plugins'> {
    authToken?: string;
    batch?: boolean;
    dataLoaderOptions?: DataLoaderOptions<unknown, unknown>;
    fetch?: typeof nodeFetch;
    fetchOptions?: RequestInit;
    projectId?: string;
    refetchInterval?: number;
    queryConcurrency?: number;
}
export declare const withDefaults: ({ authToken, projectId, ...options }: PluginOptions) => Required<PluginOptions>;
//# sourceMappingURL=options.d.ts.map