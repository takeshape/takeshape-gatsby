require(`dotenv`).config()

module.exports = {
  siteMetadata: {
    title: `Gatsby Source TakeShape Example`,
  },
  plugins: [
    `gatsby-plugin-pnpm`,
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-source-takeshape`,
      options: {
        authToken: process.env.TAKESHAPE_TOKEN,
        projectId: process.env.TAKESHAPE_PROJECT,
      },
    },
  ],
}
