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

// eslint-disable-next-line react/prop-types
const IndexPage = ({data}) => {
  return <>Hello {data.takeshape.helloWorld.content}</>
}

export default IndexPage
