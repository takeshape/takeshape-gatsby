import { PluginOptions as _PluginOptions } from 'gatsby';
import { RequestInit } from 'node-fetch';
import { Options as DataLoaderOptions } from 'dataloader';
export interface PluginOptions extends Omit<_PluginOptions, 'plugins'> {
    apiKey: string;
    apiUrl: string;
    appUrl: string;
    batch: boolean;
    dataLoaderOptions: DataLoaderOptions<unknown, unknown>;
    fetchOptions: RequestInit;
    projectId: string;
    queryConcurrency: number;
}
export declare type PluginOptionsInit = Partial<PluginOptions>;
export interface ApiConfig {
    appUrl: string;
    endpoint: string;
    authToken?: string;
    cliLogin?: boolean;
    siteId?: string;
    projectName?: string;
    projectId?: string;
    siteName?: string;
}
//# sourceMappingURL=takeshape.d.ts.map