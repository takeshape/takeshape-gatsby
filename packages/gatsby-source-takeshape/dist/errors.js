"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHttpErrors = exports.formatErrorMessage = exports.HTTPError = void 0;
class HTTPError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.HTTPError = HTTPError;
function formatErrorMessage(error, activity) {
    if (`statusCode` in error) {
        if (error.statusCode === 401 || error.statusCode === 403) {
            return new Error(`Insufficient Permissions to develop with TakeShape CLI. Your account must have the "Admin" role or better.`);
        }
        if (error.statusCode === 500) {
            return new Error(`A Server error occurred while ${activity}.`);
        }
    }
    return error;
}
exports.formatErrorMessage = formatErrorMessage;
function handleHttpErrors(error, activity) {
    throw formatErrorMessage(error, activity);
}
exports.handleHttpErrors = handleHttpErrors;
//# sourceMappingURL=errors.js.map