/* eslint-disable react/prop-types */

import React from 'react'
import {graphql} from 'gatsby'
import Img from 'gatsby-image'

export const query = graphql`
  query {
    takeshape {
      homepage: getHomepage {
        title
        image {
          path
          fixed(width: 400, height: 400) {
            aspectRatio
            base64
            height
            src
            srcSet
            srcWebp
            srcSetWebp
            width
          }
          fluid(maxWidth: 400, maxHeight: 400) {
            aspectRatio
            base64
            sizes
            src
            srcSet
            srcWebp
            srcSetWebp
          }
        }
      }
    }
  }
`

const IndexPage = ({data}) => {
  return (
    <>
      <h1>{data.takeshape.homepage.title}</h1>
      <div>
        <div>Fixed Image:</div>
        <Img fixed={data.takeshape.homepage.image.fixed} />
      </div>
      <div>
        <div>Fluid Image:</div>
        <Img fluid={data.takeshape.homepage.image.fluid} />
      </div>
    </>
  )
}

export default IndexPage
