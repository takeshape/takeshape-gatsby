"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatMap = void 0;
// Thanks! https://gist.github.com/karol-majewski/e1a53b9abd39f3b7c3f4bf150546168a
function flatMap(array, callbackfn) {
    return Array.prototype.concat(...array.map(callbackfn));
}
exports.flatMap = flatMap;
//# sourceMappingURL=arrays.js.map