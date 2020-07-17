const gatsbyNode = require('../gatsby-node');

test('Example test', () => {
  expect(gatsbyNode.sourceNodes({})).toBe('Hello world!');
});
