import React, {Fragment} from 'react'
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

const IndexPage = ({data}) => <Fragment>{data.takeshape.helloWorld.content}</Fragment>

export default IndexPage
