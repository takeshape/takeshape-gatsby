/* eslint-disable react/prop-types */

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

const IndexPage = ({data}) => {
  return <>Hello {data.takeshape.helloWorld.content}</>
}

export default IndexPage
