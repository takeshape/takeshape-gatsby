import {GraphQLObjectType, GraphQLNonNull, GraphQLSchema} from 'gatsby/graphql'
import {mapSchema, MapperKind, addTypes, modifyObjectFields, Transform} from '@graphql-tools/utils'
import {GatsbyGraphQLFieldResolver, GatsbyGraphQLConfigMap} from './types/gatsby'
import {FieldNodeTransformer, FieldTransformer, TransformObjectFields} from '@graphql-tools/wrap'

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
        resolve: this.resolver,
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

export const testFieldTransformer: FieldTransformer = (typeName, fieldName, fieldConfig) => {
  if ((fieldConfig.type as GraphQLObjectType).name === `TS_Asset`) {
    console.log(`field transformer---------------------`)
    console.log(typeName, fieldName)
    console.log(fieldConfig)
  }

  // if (typeName === `TS` && fieldName === `getHomepage`) {s
  //   console.log(`field transformer---------------------`)
  //   console.log(typeName, fieldName)
  // }

  return undefined
}

export const testFieldNodeTransformer: FieldNodeTransformer = (typeName, fieldName, fieldNode) => {
  console.log(`field node transformer---------------------`)
  console.log(typeName, fieldName, fieldNode)
  return fieldNode
}
