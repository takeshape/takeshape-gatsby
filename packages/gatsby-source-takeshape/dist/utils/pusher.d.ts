import { Reporter } from 'gatsby';
import { PluginOptions } from '../types/takeshape';
import { ActionPayload } from '../types/pusher';
export declare function handleAction(reporter: Reporter, callback: (action: ActionPayload) => void): (action: ActionPayload) => void;
export declare function subscribe({ apiKey, apiUrl, projectId }: Pick<PluginOptions, 'apiKey' | 'apiUrl' | 'projectId'>, reporter: Reporter, callback: (payload?: ActionPayload) => void): Promise<void>;
//# sourceMappingURL=pusher.d.ts.map