"use strict";

var _graphql = require("graphql");

var _transforms = require("../transforms");

const sdl = `
  type Query {
    query: String
  }

  type Mutation {
    mutation: String
  }
`;
describe('NamespaceUnderFieldTransform', () => {
  it('works', () => {
    const schema = (0, _graphql.buildSchema)(sdl);
    const transform = new _transforms.NamespaceUnderFieldTransform({
      typeName: 'Wrapper',
      fieldName: 'wrapper',
      resolver: () => ({})
    });
    const transformedSchema = transform.transformSchema(schema);
    const transformedSdl = (0, _graphql.printSchema)(transformedSchema);
    expect(transformedSdl).toMatchSnapshot();
  });
});
describe('StripNonQueryTransform', () => {
  it('works', () => {
    const schema = (0, _graphql.buildSchema)(sdl);
    const transform = new _transforms.StripNonQueryTransform();
    const transformedSchema = transform.transformSchema(schema);
    const transformedSdl = (0, _graphql.printSchema)(transformedSchema);
    expect(transformedSdl).toMatchSnapshot();
  });
});