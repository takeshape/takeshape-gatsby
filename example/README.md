# gatsby-source-takeshape example

## What is this?

This is a minimal "Hello world" example of the gatsby-source-takeshape plugin. If you want to see a more sophisticated example, check out [shape-portfolio-gatsbyjs](https://github.com/takeshape/takeshape-samples/tree/master/shape-portfolio-gatsbyjs).

## How to run this example

To build the plugin and copy it into the example's plugins folder, run this command from `gatsby-source-takeshape` directory (one level up).

```
npm run example:deploy
```

Create a TakeShape project using this button:

<a href="//app.takeshape.io/add-to-takeshape?repo=https://github.com/takeshape/gatsby-source-takeshape/tree/master/example/.takeshape/pattern"><img alt="Deploy To TakeShape" src="https://images.takeshape.io/2cccc825-70be-431c-9ba0-10ab38ecd3a7/dev/8e2f7bda-0e08-4ede-a546-6df59be6a8bb/Deploy%20to%20TakeShape%402x.png?auto=format%2Ccompress" width=205 height=38></a>

Create an `.env` file in this directory with this format:

```
TAKESHAPE_PROJECT=<takeshape project id from url>
TAKESHAPE_TOKEN=<create token in API Keys under project menu>
```

Install example dependencies in this directory.

```
npm install
```

Now you can run the example in this directory.

```
npm run start
```
