# gatsby-source-takeshape

## Description

Use TakeShape as the API for your Gatsby site.

- [Example website](https://shape-portfolio.takeshapesampleproject.com/)
- [Example website source](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs)

### Learning Resources

[Using TakeShape with Gatsby](https://www.takeshape.io/docs/using-takeshape-with-gatsby/)

## How to install

```
npm install --save @takeshape/gatsby-source-takeshape
```

## Available options

- `refetchInterval` (number of seconds) -- Periodically refetch data from the server. By default, you must restart the server to refetch data.
- `batch` (boolean) -- Set to true to batch queries that happen around the same time. By default, each query is a separate network request. See [gatsby-source-graphql](https://www.gatsbyjs.org/packages/gatsby-source-graphql/#performance-tuning) for more performance tuning tips. Default: `false`
- `fetch` -- Pass in to use whatever `fetch` implementation you want. By default, `node-fetch` is used.
- `fetchOptions` (object) -- Additional options to pass in with the second argument to `fetch`.
- `dataLoaderOptions` (object) -- Advanced. Override or set options passed to [Dataloader](https://www.npmjs.com/package/dataloader#new-dataloaderbatchloadfn--options). Dataloader is used if `batch` is `true`.

## When do I use this plugin?

You want to build a [Jamstack](https://jamstack.org/) site using [Gatsby](https://www.gatsbyjs.org/) for the client and [TakeShape](https://www.takeshape.io/) for the API.

## Examples of usage

After you install the plugin, add it to your `gatsby-config.js` like this:

```
require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: 'Gatsby Source TakeShape Example'
  },
  plugins: [
    {
      resolve: 'gatsby-source-takeshape',
      options: {}
    }
  ]
};

```

All options are optional (I love saying that).

Next, create an `.env` file in your project root. Put the following in that file:

```
TAKESHAPE_PROJECT=<paste project id here>
TAKESHAPE_TOKEN=<paste API key here>
```

Make sure `.env` is included in your `.gitignore` so you don't accidentally commit your API key!

You can get your project ID from the URL when logged in to a project on the [TakeShape](https://app.takeshape.io/). For example, the URL might look like this:

```
https://app.takeshape.io/projects/b878915b-0f45-406b-b036-8ec76be92d7c
```

In which case, the project ID is `b878915b-0f45-406b-b036-8ec76be92d7c`

You can create an API key from "API Keys" under the project menu.

## How to query for data

Here is an extremely simple query from the [hello world example](https://github.com/takeshape/gatsby-source-takeshape/tree/master/src):

```js
import React from 'react';
import {graphql} from 'gatsby';

const IndexPage = ({data}) => <>{data.takeshape.helloWorld.content}</>;

export default IndexPage;

export const query = graphql`
  query {
    takeshape {
      helloWorld: getHelloWorld {
        content
      }
    }
  }
`;
```

More advanced examples can be found in the [shape-portfolio-gatsby](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs) sample project.

You can use the API Explorer in [TakeShape](https://app.takeshape.io/) to help build your queries. You can get there from "API Explorer" under the project menu. More help can be found in [the documentation](https://www.takeshape.io/docs/quickstart/).

## How to run tests

```
npm run test
```

## How to develop locally

Currently, dependency resolution doesn't work when running the tests with npm, but it does work with pnpm or yarn. Therefore, the following examples assume you are using [pnpm](https://pnpm.js.org).

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run build`

The example project in this repo is provided for development and testing convenience. You can build and copy gatsby-source-takeshape into the example's plugin directory with this command:

```
pnpm run example:deploy
```

See [example/README.md](https://github.com/takeshape/gatsby-source-takeshape/tree/master/example/README.md) for instructions on running the example.

## How to contribute

Open an issue or PR and we'll take a look!

## License

[MIT](https://github.com/takeshape/gatsby-source-takeshape/blob/master/LICENSE)
