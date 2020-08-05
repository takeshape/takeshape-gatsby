import { PluginOptions } from '../types/takeshape';
declare type Action = {
    type: string;
    meta: {
        source: string;
    };
    payload: {
        contentId: string;
        contentTypeId: string;
    };
};
export declare function handleAction(callback: (action: any) => void): (action: Action) => void;
export declare function subscribe({ apiKey, apiUrl, appUrl, projectId, }: Pick<PluginOptions, 'appUrl' | 'apiKey' | 'apiUrl' | 'projectId'>, callback: (payload: any) => void): Promise<void>;
export {};
//# sourceMappingURL=pusher.d.ts.map