import ImgixClient from 'imgix-core-js'
import {extname} from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'
import {GatsbyCache} from 'gatsby'
import {GatsbyFixedImageProps, GatsbyFluidImageProps} from '../types/gatsby'
import {
  ImageFormat,
  ImageFit,
  ImageData,
  ImageDimensions,
  FixedArgs,
  FluidArgs,
} from '../types/images'
import {tmpl} from '../utils/strings'

export const BASE64_WIDTH = 20
export const LOWEST_FLUID_BREAKPOINT_WIDTH = 100
export const DEFAULT_FIXED_WIDTH = 400
export const DEFAULT_FLUID_MAX_WIDTH = 800
export const DEFAULT_FLUID_QUALITY = 50
export const DEFAULT_FIXED_QUALITY = 50

const sizeMultipliersFluid = [0.25, 0.5, 1, 1.5, 2, 3]

export interface ImgixParams {
  [key: string]: string | number | (string | number)[] | undefined
}

interface ImgixParamsWithHeightWidth extends ImgixParams {
  h: number
  w: number
}

interface GatsbyContext {
  cache: GatsbyCache
}

const createMetadataCacheKey = tmpl<[string]>(`takeshape-asset-metadata-%s`)
const createBase64CacheKey = tmpl<[string, string]>(`takeshape-asset-base64-%s-%s`)

export const imgixClient = new ImgixClient({
  domain: `images.takeshape.io`,
  includeLibraryParam: false,
  useHTTPS: true,
})

function safePath(assetPath: string): string {
  return assetPath.replace(/^\//, ``)
}

function getFormat(imgPath: string): ImageFormat {
  return extname(imgPath).substr(1) as ImageFormat
}

function isWebP(imgPath: string): boolean {
  return getFormat(imgPath) === ImageFormat.Webp
}

function getFormatParam(imgPath: string, toFormat?: ImageFormat): ImageFormat | undefined {
  const format = getFormat(imgPath)
  if (toFormat && toFormat !== format) {
    return toFormat
  } else if (isWebP(imgPath)) {
    // If the source is webp, let's offer a highly compatible alternative with a good compression ratio.
    return ImageFormat.Jpg
  }
  return
}

function getImageId(imgPath: string): string {
  return crypto.createHash(`sha1`).update(imgPath).digest(`hex`)
}

async function getImageData(imgPath: string, {cache}: GatsbyContext): Promise<ImageData | null> {
  const cacheKey = createMetadataCacheKey(getImageId(imgPath))
  let imgData = await cache.get(cacheKey)
  if (!imgData) {
    const dataUrl = imgixClient.buildURL(imgPath, {
      fm: `json`,
    })
    const fetched = await fetch(dataUrl)
    if (fetched.status === 200) {
      const fetchedData = await fetched.json()
      imgData = JSON.stringify(fetchedData)
      await cache.set(cacheKey, imgData)
    }
  }
  return imgData ? JSON.parse(imgData) : null
}

async function getImageDimensions(
  imgPath: string,
  context: GatsbyContext,
): Promise<ImageDimensions | null> {
  const imageData = await getImageData(imgPath, context)
  if (imageData) {
    return {
      aspectRatio: Math.round((imageData.PixelWidth / imageData.PixelHeight) * 100) / 100,
      height: imageData.PixelHeight,
      width: imageData.PixelWidth,
    }
  }
  return null
}

function hasNewAspectRatio(fit: ImageFit): boolean {
  return (
    fit === ImageFit.Crop ||
    fit === ImageFit.Min ||
    fit === ImageFit.Clamp ||
    fit === ImageFit.Facearea ||
    fit === ImageFit.Scale ||
    fit === ImageFit.Fill ||
    fit === ImageFit.Fillmax
  )
}

async function getBase64Image(
  imgPath: string,
  imgixParams: ImgixParamsWithHeightWidth,
  {cache}: GatsbyContext,
): Promise<string | null> {
  const base64Url = imgixClient.buildURL(imgPath, imgixParams)
  const base64UrlSha = crypto.createHash(`sha1`).update(base64Url).digest(`hex`)
  const cacheKey = createBase64CacheKey(getImageId(imgPath), base64UrlSha)
  let base64Data = await cache.get(cacheKey)
  if (!base64Data) {
    const fetched = await fetch(base64Url)
    if (fetched.status === 200) {
      const fetchedBuffer = await fetched.buffer()
      const fetchedContentType = fetched.headers.get(`content-type`)
      const fetchedBase64String = fetchedBuffer.toString(`base64`)
      base64Data = `data:${fetchedContentType};base64,${fetchedBase64String}`
      await cache.set(cacheKey, base64Data)
    }
  }
  return base64Data
}

async function getBase64(
  imgPath: string,
  imgixParams: ImgixParamsWithHeightWidth,
  toFormat = ImageFormat.Jpg,
  context: GatsbyContext,
): Promise<string> {
  const base64Image = await getBase64Image(
    imgPath,
    {
      ...imgixParams,
      fm: toFormat.toLowerCase(),
      h: Math.round(imgixParams.h / (imgixParams.w / BASE64_WIDTH)),
      w: BASE64_WIDTH,
    },
    context,
  )

  if (base64Image) {
    return base64Image
  }

  console.warn(`Could not get base64 data for ${imgPath}`)
  return ``
}

const getSrcSets = (
  imgPath: string,
  imgixParams: ImgixParams,
  aspectRatio: number,
  breakpoints: number[],
) => {
  return breakpoints.reduce<[string[], string[]]>(
    (acc, width) => {
      const params = {
        ...imgixParams,
        w: width,
        h: Math.round(width / aspectRatio),
      }
      const baseUrl = imgixClient.buildURL(imgPath, params)
      const webpUrl = imgixClient.buildURL(imgPath, {...params, fm: ImageFormat.Webp.toLowerCase()})
      acc[0].push(`${baseUrl} ${width}w`)
      acc[1].push(`${webpUrl} ${width}w`)
      return acc
    },
    [[], []],
  )
}

export async function getFixedGatsbyImage(
  context: GatsbyContext,
  assetPath: string,
  fixedArgs: FixedArgs = {},
  imgixParams: ImgixParams = {},
): Promise<GatsbyFixedImageProps | null> {
  assetPath = safePath(assetPath)

  const dimensions = await getImageDimensions(assetPath, context)
  if (!dimensions) {
    throw new Error(`Could not get image dimensions for ${assetPath}`)
  }

  imgixParams = {
    ...imgixParams,
    q: fixedArgs.quality || DEFAULT_FIXED_QUALITY,
  }

  const fit = fixedArgs.fit || ImageFit.Crop

  const desiredWidth =
    !fixedArgs.width && !fixedArgs.height ? DEFAULT_FIXED_WIDTH : fixedArgs.width || 0
  // The TypeScript compiler cannot seem to determine we've ensured a value for desiredWidth here
  const height = fixedArgs.height || Math.round(desiredWidth / dimensions.aspectRatio)
  const width = desiredWidth || Math.round(height * dimensions.aspectRatio)

  let aspectRatio = dimensions.aspectRatio
  if (hasNewAspectRatio(fit)) {
    aspectRatio = Math.round((width / height) * 100) / 100
  }

  const params: ImgixParamsWithHeightWidth = {
    ...imgixParams,
    fit: fit.toLowerCase(),
    h: height,
    w: width,
  }

  const format = getFormatParam(assetPath, fixedArgs.toFormat)

  if (format) {
    params.fm = format.toLowerCase()
  }

  let base64 = ``

  if (!fixedArgs.noBase64) {
    base64 = await getBase64(assetPath, params, fixedArgs.toFormatBase64, context)
  }

  const src = imgixClient.buildURL(assetPath, params)
  const srcWebp = imgixClient.buildURL(assetPath, {
    ...params,
    fm: ImageFormat.Webp.toLowerCase(),
  })
  const srcSet = imgixClient.buildSrcSet(assetPath, params)
  const srcSetWebp = imgixClient.buildSrcSet(assetPath, {
    ...params,
    fm: ImageFormat.Webp.toLowerCase(),
  })

  return {
    aspectRatio,
    base64,
    width,
    height,
    src,
    srcWebp,
    srcSet,
    srcSetWebp,
  }
}

export async function getFluidGatsbyImage(
  context: GatsbyContext,
  assetPath: string,
  fluidArgs: FluidArgs = {},
  imgixParams: ImgixParams = {},
): Promise<GatsbyFluidImageProps | null> {
  assetPath = safePath(assetPath)

  const dimensions = await getImageDimensions(assetPath, context)
  if (!dimensions) {
    throw new Error(`Could not get image dimensions for ${assetPath}`)
  }

  imgixParams = {
    ...imgixParams,
    q: fluidArgs.quality || DEFAULT_FLUID_QUALITY,
  }

  const maxWidth = Math.min(fluidArgs.maxWidth || DEFAULT_FLUID_MAX_WIDTH, dimensions.width)
  const userMaxHeight = fluidArgs.maxHeight
    ? Math.min(fluidArgs.maxHeight, dimensions.height)
    : undefined
  const maxHeight = userMaxHeight || Math.round(maxWidth / dimensions.aspectRatio)

  const fit = fluidArgs.fit || ImageFit.Crop

  let aspectRatio = dimensions.aspectRatio
  if (hasNewAspectRatio(fit)) {
    aspectRatio = Math.round((maxWidth / maxHeight) * 100) / 100
  }

  if (fit === ImageFit.Fill || fit === ImageFit.Fillmax) {
    imgixParams = {
      fill: `solid`,
      ...imgixParams,
    }
  }

  const params: ImgixParamsWithHeightWidth = {
    ...imgixParams,
    fit: fit.toLowerCase(),
    h: maxHeight,
    w: maxWidth,
  }

  const format = getFormatParam(assetPath, fluidArgs.toFormat)

  if (format) {
    params.fm = format.toLowerCase()
  }

  let base64 = ``

  if (!fluidArgs.noBase64) {
    base64 = await getBase64(assetPath, params, fluidArgs.toFormatBase64, context)
  }

  const sizes = `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`
  const src = imgixClient.buildURL(assetPath, params)
  const srcWebp = imgixClient.buildURL(assetPath, {
    ...params,
    fm: ImageFormat.Webp.toLowerCase(),
  })

  const breakpoints =
    fluidArgs.srcSetBreakpoints ||
    sizeMultipliersFluid
      .map((scale) => Math.round(maxWidth * scale))
      .filter((width) => width < dimensions.width && width > LOWEST_FLUID_BREAKPOINT_WIDTH)

  const [srcSet, srcSetWebp] = getSrcSets(assetPath, params, aspectRatio, breakpoints)

  return {
    aspectRatio,
    base64,
    sizes,
    src,
    srcSet: srcSet.join(`,\n`),
    srcSetWebp: srcSetWebp.join(`,\n`),
    srcWebp,
  }
}
