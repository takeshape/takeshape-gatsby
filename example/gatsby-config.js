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
