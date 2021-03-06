import qs from 'querystring'
import {GatsbyCache} from 'gatsby'
import {IResolvers} from '@graphql-tools/utils'
import {FluidArgs, FixedArgs} from '../types/images'
import {getFixedGatsbyImage, getFluidGatsbyImage} from './gatsby-image-tools'

export interface AssetSource {
  path: string
}

export const typeDefs = /* GraphQL */ `
  enum TakeShapeImageFit {
    CLAMP
    CLIP
    CROP
    FACEAREA
    FILL
    FILLMAX
    MAX
    MIN
    SCALE
  }

  enum TakeShapeImageFormat {
    GIF
    JP2
    JPG
    JXR
    PJPG
    PNG
    PNG8
    PNG32
    WEBP
  }

  type TakeShapeImageFixed {
    aspectRatio: Float!
    base64: String
    height: Int!
    width: Int!
    src: String!
    srcSet: String!
    srcWebp: String!
    srcSetWebp: String!
  }

  type TakeShapeImageFluid {
    aspectRatio: Float!
    base64: String
    sizes: String!
    src: String!
    srcSet: String!
    srcWebp: String!
    srcSetWebp: String!
  }

  extend type TS_Asset {
    fixed(
      width: Int
      height: Int
      fit: TakeShapeImageFit
      noBase64: Boolean
      quality: Int
      toFormat: TakeShapeImageFormat
      toFormatBase64: TakeShapeImageFormat
      imgixParams: String
    ): TakeShapeImageFixed!

    fluid(
      maxWidth: Int
      maxHeight: Int
      fit: TakeShapeImageFit
      noBase64: Boolean
      quality: Int
      toFormat: TakeShapeImageFormat
      toFormatBase64: TakeShapeImageFormat
      srcSetBreakpoints: [Int]
      imgixParams: String
    ): TakeShapeImageFluid!
  }
`

export const resolvers = ({cache}: {cache: GatsbyCache}): IResolvers => ({
  TS_Asset: {
    fixed: {
      resolve(source: AssetSource, args: FixedArgs) {
        return getFixedGatsbyImage({cache}, source.path, args, qs.parse(args.imgixParams || ``))
      },
    },
    fluid: {
      resolve(source: AssetSource, args: FluidArgs) {
        return getFluidGatsbyImage({cache}, source.path, args, qs.parse(args.imgixParams || ``))
      },
    },
  },
})
