import { ApiConfig } from '../types/takeshape';
export declare function isJWT(str: string): boolean;
export declare function getAuthHeader(authToken?: string): {
    [name: string]: string;
};
export default function api<T = any>(params: ApiConfig, method: string, path: string, body?: any): Promise<T>;
//# sourceMappingURL=takeshape-api.d.ts.map