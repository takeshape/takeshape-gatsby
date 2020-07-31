import {GraphQLObjectType, GraphQLNonNull, GraphQLSchema, GraphQLFieldConfigMap} from 'gatsby/graphql';
import {mapSchema, MapperKind, addTypes, modifyObjectFields} from '@graphql-tools/utils';

type Resolver = (parent, args, context) => Record<string, unknown>;

export class NamespaceUnderFieldTransform {
  typeName: string;
  fieldName: string;
  resolver: Resolver;

  constructor({typeName, fieldName, resolver}: {typeName: string; fieldName: string; resolver: Resolver}) {
    this.typeName = typeName;
    this.fieldName = fieldName;
    this.resolver = resolver;
  }

  transformSchema(schema: GraphQLSchema): GraphQLSchema {
    const queryConfig = schema.getQueryType().toConfig();

    const nestedQuery = new GraphQLObjectType({
      ...queryConfig,
      name: this.typeName
    });

    let newSchema = addTypes(schema, [nestedQuery]);

    const newRootFieldConfigMap: GraphQLFieldConfigMap<boolean, boolean> = {
      [this.fieldName]: {
        type: new GraphQLNonNull(nestedQuery),
        resolve: (parent, args, context) => {
          if (this.resolver !== null) {
            return this.resolver(parent, args, context);
          }

          return {};
        }
      }
    };

    [newSchema] = modifyObjectFields(newSchema, queryConfig.name, () => true, newRootFieldConfigMap);

    return newSchema;
  }
}

export class StripNonQueryTransform {
  transformSchema(schema: GraphQLSchema): GraphQLSchema {
    return mapSchema(schema, {
      [MapperKind.MUTATION]() {
        return null;
      },
      [MapperKind.SUBSCRIPTION]() {
        return null;
      }
    });
  }
}
