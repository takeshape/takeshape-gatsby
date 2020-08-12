import { HeadersInit } from 'node-fetch';
import { ApolloLink } from 'apollo-link';
import { PluginOptions } from '../types/takeshape';
export interface CreateDataloaderLinkOptions extends Required<Pick<PluginOptions, 'headers' | 'fetchOptions' | 'dataLoaderOptions' | 'queryConcurrency'>> {
    headers: HeadersInit;
    uri: string;
}
export declare function createDataloaderLink(options: CreateDataloaderLinkOptions): ApolloLink;
//# sourceMappingURL=dataloader-link.d.ts.map