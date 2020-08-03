"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripNonQueryTransform = exports.NamespaceUnderFieldTransform = void 0;
const graphql_1 = require("graphql");
const utils_1 = require("@graphql-tools/utils");
class NamespaceUnderFieldTransform {
    constructor({ typeName, fieldName, resolver, }) {
        this.typeName = typeName;
        this.fieldName = fieldName;
        this.resolver = resolver;
    }
    transformSchema(schema) {
        const queryType = schema.getQueryType();
        if (!queryType) {
            return schema;
        }
        const queryConfig = queryType.toConfig();
        const nestedQuery = new graphql_1.GraphQLObjectType({
            ...queryConfig,
            name: this.typeName,
        });
        let newSchema = utils_1.addTypes(schema, [nestedQuery]);
        const newRootFieldConfigMap = {
            [this.fieldName]: {
                type: new graphql_1.GraphQLNonNull(nestedQuery),
                resolve: this.resolver,
            },
        };
        [newSchema] = utils_1.modifyObjectFields(newSchema, queryConfig.name, () => true, newRootFieldConfigMap);
        return newSchema;
    }
}
exports.NamespaceUnderFieldTransform = NamespaceUnderFieldTransform;
class StripNonQueryTransform {
    transformSchema(schema) {
        return utils_1.mapSchema(schema, {
            [utils_1.MapperKind.MUTATION]() {
                return null;
            },
            [utils_1.MapperKind.SUBSCRIPTION]() {
                return null;
            },
        });
    }
}
exports.StripNonQueryTransform = StripNonQueryTransform;
//# sourceMappingURL=transforms.js.map