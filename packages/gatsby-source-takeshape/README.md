# gatsby-source-takeshape

Use the TakeShape CMS as the data source for your Gatsby website.

- [Gatsby Starter project](https://github.com/takeshape/gatsby-starter-takeshape-portfolio)
- [Example website](https://shape-portfolio.takeshapesampleproject.com/)
- [Example website source](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs)

### Learning Resources

[Using TakeShape with Gatsby](https://www.takeshape.io/docs/using-takeshape-with-gatsby/)

## Installing

For use with Gatsby 3.x:
```console
$ npm install --save gatsby-source-takeshape
```
For use with Gatsby 2.x:
```console
$ npm install --save gatsby-source-takeshape@1
```



After you install the plugin, add it to your `gatsby-config.js` like this:

```js
require('dotenv').config()

module.exports = {
  siteMetadata: {
    title: 'Gatsby Source TakeShape Example',
  },
  plugins: [
    {
      resolve: 'gatsby-source-takeshape',
      options: {
        apiKey: process.env.TAKESHAPE_TOKEN,
        projectId: process.env.TAKESHAPE_PROJECT,
      },
    },
  ],
}
```

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

## Options

| Name                | Type      | Description                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiKey`            | `string`  | Your API Key from your project. You'll need `dev` or `ci` permissions. Create in the `API Keys` section under the projects dropdown.                                                                                                                                                                                                                                                       |
| `projectId`         | `string`  | Your project ID from your TakeShape project. (see note below)                                                                                                                                                                                                                                                                                                                              |
| `batch`             | `boolean` | Set to true to batch queries that happen around the same time. By default, each query is a separate network request. See [gatsby-source-graphql](https://www.gatsbyjs.org/packages/gatsby-source-graphql/#performance-tuning) for more performance tuning tips. Default: `false`                                                                                                           |
| `fetchOptions`      | `object`  | Additional options to pass in with the second argument to `fetch`.                                                                                                                                                                                                                                                                                                                         |
| `dataLoaderOptions` | `object`  | Advanced. Override or set options passed to [Dataloader](https://www.npmjs.com/package/dataloader#new-dataloaderbatchloadfn--options). Dataloader is used if `batch` is `true`.                                                                                                                                                                                                            |
| `throttle`          | `boolean` | Throttle queries based on the `x-ratelimit-limit` response header. Enabling throttling will slow down your build, but will reduce the risk of hitting your API rate limit. Regardless of throttling, [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) errors are handled with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff). Default `false` |

> You can get your project ID from the URL when logged in to a project on the
> [TakeShape](https://app.takeshape.io/). For example, the URL might look like
> this: `https://app.takeshape.io/projects/b878915b-0f45-406b-b036-8ec76be92d7c`
> In this case, the project ID is `b878915b-0f45-406b-b036-8ec76be92d7c`

## Data Queries

Here is an extremely simple query from the
[hello world example](https://github.com/takeshape/takeshape-gatsby/tree/trunk/packages/example/src/index.jsx):

```js
import React from 'react'
import {graphql} from 'gatsby'

export const query = graphql`
  query {
    takeshape {
      helloWorld: getHelloWorld {
        content
      }
    }
  }
`

const IndexPage = ({data}) => <>{data.takeshape.helloWorld.content}</>

export default IndexPage
```

More advanced examples can be found in the
[shape-portfolio-gatsby](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs)
sample project.

You can use the API Explorer in [TakeShape](https://app.takeshape.io/) to help
build your queries. You can get there from "API Explorer" under the project
menu. More help can be found in
[the documentation](https://www.takeshape.io/docs/quickstart/).

## Image Queries

You can use Gatsby's GraphQL queries to pull objects suitable for use with the
[gatsby-image](https://www.gatsbyjs.com/plugins/gatsby-image/) plugin.
TakeShape's `fixed` and `fluid` fields will provide objects that support the
base64 blur up effect, provide srcSets for responsive images, and faster page
loads.

> Note: Because of limitations in how Gatsby handles third-party schemas you
> must include the `path` field on your image queries for the `fixed` and
> `fluid` fields to work properly.

### Fixed

```js
import React from 'react'
import Img from 'gatsby-image'

export const query = graphql`
  query HomepageQuery {
    takeshape {
      homepage: getHomepage {
        title
        image {
          path // <-- this is important, see note above
          fixed(width: 400, height: 400) {
            ...GatsbyTakeShapeImageFixed
          }
        }
      }
    }
  }
`

const Homepage = ({data}) => (
  <>
    <h1>{data.takeshape.homepage.title}</h1>
    <Img fixed={data.takeshape.homepage.image.fixed} />
  </>
)

export default Homepage
```

### Fluid

```js
import React from 'react'
import Img from 'gatsby-image'

export const query = graphql`
  query HomepageQuery {
    takeshape {
      homepage: getHomepage {
        title
        image {
          path // <-- this is important, see note above
          fluid(maxWidth: 400, maxHeight: 400) {
            ...GatsbyTakeShapeImageFluid
          }
        }
      }
    }
  }
`

const Homepage = ({data}) => (
  <>
    <h1>{data.takeshape.homepage.title}</h1>
    <Img fluid={data.takeshape.homepage.image.fluid} />
  </>
)

export default Homepage
```

### Args

Image queries support a number of arguments. Take a look at the
[type defs](src/images/gatsby-image-schema.ts#L31-L50) to see what you can do.

There is also the `imgixParams` argument which allows you to pass in arbitrary
[imgix](https://docs.imgix.com/apis/url) filters as a query param-formatted
string, e.g., `crop=faces,edges&txt=Hello%20World!`.

## Developing

This plugin needs to be run inside of a Gatsby project. See
[example/README.md](https://github.com/takeshape/takeshape-gatsby/tree/trunk/packages/example/README.md)
for instructions on running the example.

The following scripts are useful when developing:

- `pnpm run lint`
- `pnpm run test`
- `pnpm run build`

## Contributing

Open an issue or PR and we'll take a look!

## License

[MIT](https://github.com/takeshape/takeshape-gatsby/blob/trunk/packages/gatsby-source-takeshape/LICENSE)
