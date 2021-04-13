import {GraphQLObjectType, GraphQLNonNull, GraphQLSchema} from 'gatsby/graphql'
import {mapSchema, MapperKind, addTypes, modifyObjectFields} from '@graphql-tools/utils'
import {Transform} from '@graphql-tools/delegate'
import {GatsbyGraphQLFieldResolver, GatsbyGraphQLConfigMap} from './types/gatsby'

export class NamespaceUnderFieldTransform implements Transform {
  typeName: string
  fieldName: string
  resolver: GatsbyGraphQLFieldResolver

  constructor({
    typeName,
    fieldName,
    resolver,
  }: {
    typeName: string
    fieldName: string
    resolver: GatsbyGraphQLFieldResolver
  }) {
    this.typeName = typeName
    this.fieldName = fieldName
    this.resolver = resolver
  }

  transformSchema(schema: GraphQLSchema): GraphQLSchema {
    const queryType = schema.getQueryType()

    if (!queryType) {
      return schema
    }

    const queryConfig = queryType.toConfig()

    const nestedQuery = new GraphQLObjectType({
      ...queryConfig,
      name: this.typeName,
    })

    let newSchema = addTypes(schema, [nestedQuery])

    const newRootFieldConfigMap: GatsbyGraphQLConfigMap = {
      [this.fieldName]: {
        type: new GraphQLNonNull(nestedQuery),
        resolve: (parent, args, context, info) => {
          if (this.resolver != null) {
            return this.resolver(parent, args, context, info)
          }

          return {}
        },
      },
    }

    ;[newSchema] = modifyObjectFields(
      newSchema,
      queryConfig.name,
      () => true,
      newRootFieldConfigMap,
    )

    return newSchema
  }
}

export class StripNonQueryTransform implements Transform {
  transformSchema(schema: GraphQLSchema): GraphQLSchema {
    return mapSchema(schema, {
      [MapperKind.MUTATION]() {
        return null
      },
      [MapperKind.SUBSCRIPTION]() {
        return null
      },
    })
  }
}
