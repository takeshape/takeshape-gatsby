export declare class HTTPError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function formatErrorMessage(error: Error | HTTPError, activity: string): Error;
export declare function handleHttpErrors(error: Error | HTTPError, activity: string): void;
//# sourceMappingURL=errors.d.ts.map