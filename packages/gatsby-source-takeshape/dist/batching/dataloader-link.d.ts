import { HeadersInit } from 'node-fetch';
import { ApolloLink } from 'apollo-link';
import { PluginOptions } from '../utils/options';
export interface CreateDataloaderLinkOptions extends Required<Pick<PluginOptions, 'headers' | 'fetch' | 'fetchOptions' | 'dataLoaderOptions' | 'queryConcurrency'>> {
    headers: HeadersInit;
    uri: string;
}
export declare function createDataloaderLink(options: CreateDataloaderLinkOptions): ApolloLink;
//# sourceMappingURL=dataloader-link.d.ts.map