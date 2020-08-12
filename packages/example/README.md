# takeshape-gatsby example

A demo of `gatsby-source-takeshape`, primarily for development and debugging.

## How to run this example

> You'll need [pnpm](https://pnpm.js.org/en/installation) installed to use this
> monorepo.

1. Get a `projectId` and `apiKey` from a TakeShape project. Currently this uses
   the `Shape Blog` starter project.
2. Create a `.env` file in this directory:

```inputrc
TAKESHAPE_PROJECT=<projectId>
TAKESHAPE_TOKEN=<apiKey>
```

3. From the root of the monorepo (`cd ../../`):

```console
$ pnpm develop
```
