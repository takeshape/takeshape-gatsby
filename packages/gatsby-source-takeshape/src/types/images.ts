export interface FixedArgs {
  fit?: ImageFit
  height?: number
  noBase64?: boolean
  quality?: number
  toFormat?: ImageFormat
  toFormatBase64?: ImageFormat
  width?: number
}

export interface FluidArgs {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  srcSetBreakpoints?: number[]
  fit?: ImageFit
  toFormat?: ImageFormat
  toFormatBase64?: ImageFormat
  aspectRatio?: number
  noBase64?: boolean
}

export enum ImageFormat {
  Gif = `gif`,
  Jp2 = `jp2`,
  Jpg = `jpg`,
  Jxr = `jxr`,
  Pjpg = `pjpg`,
  Png = `png`,
  Png8 = `png8`,
  Png32 = `png32`,
  Webp = `webp`,
}

export enum ImageFit {
  Clamp = `clamp`,
  Clip = `clip`,
  Crop = `crop`,
  Facearea = `facearea`,
  Fill = `fill`,
  Fillmax = `fillmax`,
  Max = `max`,
  Min = `min`,
  Scale = `scale`,
}

export type ImageData = {
  'Content-Type': string
  DPIWidth: number
  'Content-Length': string
  Depth: number
  DPIHeight: number
  PixelHeight: number
  PixelWidth: number
  ColorModel: string
  ProfileName: string
}

export type ImageDimensions = {
  width: number
  height: number
  aspectRatio: number
}

export type ImgixParams = {
  fm?: ImageFormat
  [key: string]: string | number | (string | number)[] | undefined
}
