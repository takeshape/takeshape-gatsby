import ImgixClient from 'imgix-core-js'
import path, {extname} from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fetch from 'node-fetch'
import {GatsbyFixedImageProps, GatsbyFluidImageProps} from '../types/gatsby'
import {
  ImageFormat,
  ImageFit,
  ImageData,
  ImageDimensions,
  FixedArgs,
  FluidArgs,
} from '../types/images'

export const CACHE_ASSETS_FOLDER = `${process.cwd()}/.cache/takeshape/assets`
export const BASE64_WIDTH = 20
export const LOWEST_FLUID_BREAKPOINT_WIDTH = 100
export const DEFAULT_FIXED_WIDTH = 400
export const DEFAULT_FLUID_MAX_WIDTH = 800
export const DEFAULT_FLUID_QUALITY = 50
export const DEFAULT_FIXED_QUALITY = 50

const sizeMultipliersFluid = [0.25, 0.5, 1, 1.5, 2, 3]

let cacheDirCreated = false

export interface ImgixParams {
  fm?: ImageFormat
  [key: string]: string | number | (string | number)[] | undefined
}

interface ImgixParamsWithHeightWidth extends ImgixParams {
  h: number
  w: number
}

const imgix = new ImgixClient({
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
    return ImageFormat.Jpg
  }
  return
}

function getImageId(imgPath: string): string {
  return crypto.createHash(`sha1`).update(imgPath).digest(`hex`)
}

function ensureCacheDir() {
  if (!cacheDirCreated) {
    fs.mkdirSync(CACHE_ASSETS_FOLDER, {
      recursive: true,
    })
    cacheDirCreated = true
  }
}

async function cacheGet(assetPath: string): Promise<string | null> {
  const cachePath = path.join(CACHE_ASSETS_FOLDER, assetPath)
  if (fs.existsSync(cachePath)) {
    return fs.promises.readFile(cachePath, `utf8`)
  }
  return null
}

async function cacheSet(assetPath: string, data: string): Promise<string> {
  const cachePath = path.join(CACHE_ASSETS_FOLDER, assetPath)
  await fs.promises.writeFile(cachePath, data)
  return data
}

async function getImageData(imgPath: string): Promise<ImageData | null> {
  ensureCacheDir()
  const dataPath = `${getImageId(imgPath)}.json`
  let imgData = await cacheGet(dataPath)
  if (!imgData) {
    const dataUrl = imgix.buildURL(imgPath, {
      fm: `json`,
    })
    const fetched = await fetch(dataUrl)
    if (fetched.status === 200) {
      const fetchedData = await fetched.json()
      imgData = await cacheSet(dataPath, JSON.stringify(fetchedData))
    }
  }
  if (imgData) {
    return JSON.parse(imgData)
  }
  return null
}

async function getImageDimensions(imgPath: string): Promise<ImageDimensions | null> {
  const imageData = await getImageData(imgPath)
  if (imageData) {
    return {
      aspectRatio: imageData.PixelWidth / imageData.PixelHeight,
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
): Promise<string | null> {
  ensureCacheDir()
  const base64Url = imgix.buildURL(imgPath, imgixParams)
  const base64UrlSha = crypto.createHash(`sha1`).update(base64Url).digest(`hex`)
  const base64Path = `${getImageId(imgPath)}-${base64UrlSha}.base64`
  let base64Data = await cacheGet(base64Path)
  if (!base64Data) {
    const fetched = await fetch(base64Url)
    if (fetched.status === 200) {
      const fetchedBuffer = await fetched.buffer()
      const fetchedContentType = fetched.headers.get(`content-type`)
      const fetchedBase64String = fetchedBuffer.toString(`base64`)
      const base64String = `data:${fetchedContentType};base64,${fetchedBase64String}`
      base64Data = await cacheSet(base64Path, base64String)
    }
  }
  return base64Data
}

async function getBase64(
  imgPath: string,
  imgixParams: ImgixParamsWithHeightWidth,
  toFormat = ImageFormat.Jpg,
): Promise<string> {
  const base64Image = await getBase64Image(imgPath, {
    ...imgixParams,
    fm: toFormat,
    h: Math.round(imgixParams.h / (imgixParams.w / BASE64_WIDTH)),
    w: BASE64_WIDTH,
  })

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
      const baseUrl = imgix.buildURL(imgPath, params)
      const webpUrl = imgix.buildURL(imgPath, {...params, fm: ImageFormat.Webp})
      acc[0].push(`${baseUrl} ${width}w`)
      acc[1].push(`${webpUrl} ${width}w`)
      return acc
    },
    [[], []],
  )
}

export async function getFixedGatsbyImage(
  assetPath: string,
  fixedArgs: FixedArgs = {},
  imgixParams: ImgixParams = {},
): Promise<GatsbyFixedImageProps | null> {
  assetPath = safePath(assetPath)

  const dimensions = await getImageDimensions(assetPath)
  if (!dimensions) {
    throw new Error(`Could not get image dimensions for ${assetPath}`)
  }

  imgixParams = {
    ...imgixParams,
    q: fixedArgs.quality || DEFAULT_FIXED_QUALITY,
  }

  const fit = fixedArgs.fit || ImageFit.Crop

  const desiredWidth = !fixedArgs.width && !fixedArgs.height ? DEFAULT_FIXED_WIDTH : fixedArgs.width
  const height = fixedArgs.height
    ? fixedArgs.height
    : Math.round(desiredWidth! / dimensions.aspectRatio)
  const width = desiredWidth ? desiredWidth : Math.round(height * dimensions.aspectRatio)

  let aspectRatio = dimensions.aspectRatio
  if (hasNewAspectRatio(fit)) {
    aspectRatio = width / height
  }

  const params: ImgixParamsWithHeightWidth = {
    ...imgixParams,
    fit,
    h: height,
    w: width,
  }

  const format = getFormatParam(assetPath, fixedArgs.toFormat)

  if (format) {
    params.fm = format
  }

  let base64 = ``

  if (!fixedArgs.noBase64) {
    base64 = await getBase64(assetPath, params, fixedArgs.toFormatBase64)
  }

  const src = imgix.buildURL(assetPath, params)
  const srcWebp = imgix.buildURL(assetPath, {...params, fm: ImageFormat.Webp})
  const srcSet = imgix.buildSrcSet(assetPath, params)
  const srcSetWebp = imgix.buildSrcSet(assetPath, {...params, fm: ImageFormat.Webp})

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
  assetPath: string,
  fluidArgs: FluidArgs = {},
  imgixParams: ImgixParams = {},
): Promise<GatsbyFluidImageProps | null> {
  assetPath = safePath(assetPath)

  const dimensions = await getImageDimensions(assetPath)
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
    aspectRatio = maxWidth / maxHeight
  }

  if (fit === ImageFit.Fill || fit === ImageFit.Fillmax) {
    imgixParams = {
      fill: `solid`,
      ...imgixParams,
    }
  }

  const params: ImgixParamsWithHeightWidth = {
    ...imgixParams,
    fit,
    h: maxHeight,
    w: maxWidth,
  }

  const format = getFormatParam(assetPath, fluidArgs.toFormat)

  if (format) {
    params.fm = format
  }

  let base64 = ``

  if (!fluidArgs.noBase64) {
    base64 = await getBase64(assetPath, params, fluidArgs.toFormatBase64)
  }

  const sizes = `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`
  const src = imgix.buildURL(assetPath, params)
  const srcWebp = imgix.buildURL(assetPath, {...params, fm: ImageFormat.Webp})

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
