import {graphql} from 'gatsby'

/**
 * The simplest set of fields for fixed assets
 * @type {Fragment}
 * @example
 * myTakeShapeAssetField {
 *   fixed {
 *     ...GatsbyTakeShapeImageFixed
 *     # ^ identical to using the following fields:
 *     # aspectRatio
 *     # base64
 *     # height
 *     # src
 *     # srcSet
 *     # srcWebp
 *     # srcSetWebp
 *     # width
 *   }
 * }
 */
export const gatsbyTakeShapeImageFixed = graphql`
  fragment GatsbyTakeShapeImageFixed on TakeShapeImageFixed {
    aspectRatio
    base64
    height
    src
    srcSet
    srcWebp
    srcSetWebp
    width
  }
`

/**
 * Assets without the blurred base64 imate
 * @type {Fragment}
 */
export const gatsbyTakeShapeImageFixedNoBase64 = graphql`
  fragment GatsbyTakeShapeImageFixed_noBase64 on TakeShapeImageFixed {
    aspectRatio
    height
    src
    srcSet
    srcWebp
    srcSetWebp
    width
  }
`

/**
 * The simplest set of fields for fluid assets
 * @type {Fragment}
 */
export const gatsbyTakeShapeImageFluid = graphql`
  fragment GatsbyTakeShapeImageFluid on TakeShapeImageFluid {
    aspectRatio
    base64
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`

/**
 * Fluid assets without the blurred base64 image
 * @type {Fragment}
 */
export const gatsbyTakeShapeImageFluidNoBase64 = graphql`
  fragment GatsbyTakeShapeImageFluid_noBase64 on TakeShapeImageFluid {
    aspectRatio
    src
    srcSet
    srcWebp
    srcSetWebp
    sizes
  }
`
