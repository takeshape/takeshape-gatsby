"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmpl = void 0;
const util_1 = require("util");
function tmpl(pattern) {
    return (...params) => {
        return util_1.format(pattern, ...params);
    };
}
exports.tmpl = tmpl;
//# sourceMappingURL=strings.js.map