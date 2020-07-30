"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StripNonQueryTransform = exports.NamespaceUnderFieldTransform = void 0;

var _graphql = require("gatsby/graphql");

var _utils = require("@graphql-tools/utils");

class NamespaceUnderFieldTransform {
  constructor({
    typeName,
    fieldName,
    resolver
  }) {
    this.typeName = typeName;
    this.fieldName = fieldName;
    this.resolver = resolver;
  }

  transformSchema(schema) {
    const queryConfig = schema.getQueryType().toConfig();
    const nestedQuery = new _graphql.GraphQLObjectType({ ...queryConfig,
      name: this.typeName
    });
    let newSchema = (0, _utils.addTypes)(schema, [nestedQuery]);
    const newRootFieldConfigMap = {
      [this.fieldName]: {
        type: new _graphql.GraphQLNonNull(nestedQuery),
        resolve: (parent, args, context) => {
          if (this.resolver !== null) {
            return this.resolver(parent, args, context);
          }

          return {};
        }
      }
    };
    [newSchema] = (0, _utils.modifyObjectFields)(newSchema, queryConfig.name, () => true, newRootFieldConfigMap);
    return newSchema;
  }

}

exports.NamespaceUnderFieldTransform = NamespaceUnderFieldTransform;

class StripNonQueryTransform {
  transformSchema(schema) {
    return (0, _utils.mapSchema)(schema, {
      [_utils.MapperKind.MUTATION]() {
        return null;
      },

      [_utils.MapperKind.SUBSCRIPTION]() {
        return null;
      }

    });
  }

}

exports.StripNonQueryTransform = StripNonQueryTransform;