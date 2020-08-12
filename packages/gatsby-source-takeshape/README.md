# gatsby-source-takeshape

## Description

Use TakeShape as the API for your Gatsby site.

-   [Example website](https://shape-portfolio.takeshapesampleproject.com/)
-   [Example website source](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs)

### Learning Resources

[Using TakeShape with Gatsby](https://www.takeshape.io/docs/using-takeshape-with-gatsby/)

## Installing

```console
$ npm install --save gatsby-source-takeshape
```

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
      options: {
        apiKey: process.env.TAKESHAPE_TOKEN,
        projectId: process.env.TAKESHAPE_PROJECT,
      }
    }
  ]
};
```

## Options

-   `apiKey` (string) -- Your API Key from your TakeShape project. You'll need
    `dev` or `ci` permissions. Create it in the `API Keys` section under the
    projects dropdown.
-   `projectId` (string) -- Your project ID from your TakeShape project. (see
    note below)
-   `batch` (boolean) -- Set to true to batch queries that happen around the
    same time. By default, each query is a separate network request. See
    [gatsby-source-graphql](https://www.gatsbyjs.org/packages/gatsby-source-graphql/#performance-tuning)
    for more performance tuning tips. Default: `false`
-   `fetchOptions` (object) -- Additional options to pass in with the second
    argument to `fetch`.
-   `dataLoaderOptions` (object) -- Advanced. Override or set options passed to
    [Dataloader](https://www.npmjs.com/package/dataloader#new-dataloaderbatchloadfn--options).
    Dataloader is used if `batch` is `true`.

> You can get your project ID from the URL when logged in to a project on the
> [TakeShape](https://app.takeshape.io/). For example, the URL might look like
> this: `https://app.takeshape.io/projects/b878915b-0f45-406b-b036-8ec76be92d7c`
> In this case, the project ID is `b878915b-0f45-406b-b036-8ec76be92d7c`

## When do I use this plugin?

You want to build a [Jamstack](https://jamstack.org/) site using
[Gatsby](https://www.gatsbyjs.org/) for the client and
[TakeShape](https://www.takeshape.io/) for the API.

## `.env` variables

Like many projects out there, you can use
[dotenv](https://github.com/motdotla/dotenv) to load a `.env` file with
variables in your project's directory.

It would look something like this:

```inputrc
TAKESHAPE_PROJECT=<paste project id here>
TAKESHAPE_TOKEN=<paste API key here>
```

> Make sure `.env` is included in your `.gitignore` so you don't accidentally
> commit your API key!

## Querying

Here is an extremely simple query from the
[hello world example](https://github.com/takeshape/takeshape-gatsby/tree/trunk/packages/example/src/index.jsx):

```js
import React from 'react'
import {graphql} from 'gatsby'

const IndexPage = ({data}) => <>{data.takeshape.helloWorld.content}</>

export default IndexPage

export const query = graphql`
    query {
        takeshape {
            helloWorld: getHelloWorld {
                content
            }
        }
    }
`
```

More advanced examples can be found in the
[shape-portfolio-gatsby](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs)
sample project.

You can use the API Explorer in [TakeShape](https://app.takeshape.io/) to help
build your queries. You can get there from "API Explorer" under the project
menu. More help can be found in
[the documentation](https://www.takeshape.io/docs/quickstart/).

## Developing

### How to run tests

```console
pnpm run test
```

### How to develop locally

Currently, dependency resolution doesn't work when running the tests with npm,
but it does work with pnpm or yarn. Therefore, the following examples assume you
are using [pnpm](https://pnpm.js.org).

-   `pnpm run lint`
-   `pnpm run typecheck`
-   `pnpm run test`
-   `pnpm run build`

The example project in this repo is provided for development and testing
convenience. You can build and copy gatsby-source-takeshape into the example's
plugin directory with this command:

```console
pnpm run example:deploy
```

See
[example/README.md](https://github.com/takeshape/takeshape-gatsby/tree/trunk/packages/example/README.md)
for instructions on running the example.

## Contributing

Open an issue or PR and we'll take a look!

## License

[MIT](https://github.com/takeshape/takeshape-gatsby/blob/trunk/packages/gatsby-source-takeshape/LICENSE)
