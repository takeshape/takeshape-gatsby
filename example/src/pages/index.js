import React from 'react';
import {graphql} from 'gatsby';

const IndexPage = ({data}) => <>{data.takeshape.helloWorld.content}</>;

export default IndexPage;

export const query = graphql`
  query {
    takeshape {
      helloWorld: getHelloWorld {
        content
      }
    }
  }
`;
