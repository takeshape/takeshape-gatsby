/* eslint-disable react/prop-types */

import React from 'react'
import {graphql} from 'gatsby'

export const query = graphql`
  query {
    takeshape {
      homepage: getHomepage {
        title
        image {
          filename
        }
      }
    }
  }
`

const IndexPage = ({data}) => {
  return <>{data.takeshape.homepage.title}</>
}

export default IndexPage
