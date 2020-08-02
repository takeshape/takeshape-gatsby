"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onRenderBody = void 0;
const react_1 = require("react");
exports.onRenderBody = ({ setHeadComponents }) => {
    setHeadComponents([
        react_1.createElement(`link`, {
            rel: `preconnect`,
            key: `takeshape-images-preconnect`,
            href: `https://images.takeshape.io`,
        }),
    ]);
};
//# sourceMappingURL=gatsby-ssr.js.map