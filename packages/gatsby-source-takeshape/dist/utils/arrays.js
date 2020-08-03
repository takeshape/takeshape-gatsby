"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatMap = void 0;
function flatMap(array, callbackfn) {
    return Array.prototype.concat(...array.map(callbackfn));
}
exports.flatMap = flatMap;
//# sourceMappingURL=arrays.js.map