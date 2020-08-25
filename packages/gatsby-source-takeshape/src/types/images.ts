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
  noBase64?: boolean
}

export enum ImageFormat {
  Gif = `GIF`,
  Jp2 = `JP2`,
  Jpg = `JPG`,
  Jxr = `JXR`,
  Pjpg = `PJPG`,
  Png = `PNG`,
  Png8 = `PNG8`,
  Png32 = `PNG32`,
  Webp = `WEBP`,
}

export enum ImageFit {
  Clamp = `CLAMP`,
  Clip = `CLIP`,
  Crop = `CROP`,
  Facearea = `FACEAREA`,
  Fill = `FILL`,
  Fillmax = `FILLMAX`,
  Max = `MAX`,
  Min = `MIN`,
  Scale = `SCALE`,
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
