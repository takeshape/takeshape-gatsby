/* eslint-disable react/prop-types */

import React from 'react'
import {graphql} from 'gatsby'

export const query = graphql`
  query {
    takeshape {
      helloWorld: getSiteSettings {
        siteTitle
      }
    }
  }
`

const IndexPage = ({data}) => {
  return <>{data.takeshape.helloWorld.siteTitle}</>
}

export default IndexPage
