import {graphql} from 'gatsby'

export const tsImageFixed = graphql`
  fragment GatsbyTakeShapeImageFixed on tsImageFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const tsImageFixedNoBase64 = graphql`
  fragment GatsbyTakeShapeImageFixed_noBase64 on tsImageFixed {
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`

export const tsImageFluid = graphql`
  fragment GatsbyTakeShapeImageFluid on tsImageFluid {
    base64
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

export const tsImageFluidNoBase64 = graphql`
  fragment GatsbyTakeShapeImageFluid_noBase64 on tsImageFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
