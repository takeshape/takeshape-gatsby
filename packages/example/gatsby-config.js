require(`dotenv`).config()

module.exports = {
  siteMetadata: {
    title: `Gatsby Source TakeShape Example`,
  },
  plugins: [
    `gatsby-plugin-pnpm`,
    {
      resolve: `gatsby-source-takeshape`,
      options: {
        apiKey: process.env.TAKESHAPE_TOKEN,
        projectId: process.env.TAKESHAPE_PROJECT,
        apiUrl: `http://localhost:3000`,
      },
    },
  ],
}
