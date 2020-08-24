import rimraf from 'rimraf'
import {
  getFluidGatsbyImage,
  getFixedGatsbyImage,
  imgixClient,
  cacheSet,
  cacheGet,
  CACHE_ASSETS_FOLDER,
} from '../gatsby-image-utils'
import {ImageFormat, ImageFit} from '../../types/images'

// Since it's easier to work with imgix fixtures, we'll override the domain
const IMGIX_DOMAIN = `assets.imgix.net`

const assetPathJpg = `unsplash/pineneedles.jpg`
const assetPathPng = `examples/lorie.png`
const assetPathBad = `examples/some-bad-path.jpg`

describe(`gatsby image utils`, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(imgixClient as any).settings.domain = IMGIX_DOMAIN

  describe(`when requesting a fluid image`, () => {
    beforeAll(() => {
      rimraf.sync(`${CACHE_ASSETS_FOLDER}/*`)
    })

    it(`matches snapshot for jpg with no parameters`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg)
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200)`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg, {maxWidth: 1200})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200) and max height (768)`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg, {maxWidth: 1200, maxHeight: 768})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with toFormat set to (png)`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg, {toFormat: ImageFormat.Png})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for png with toFormat set to (jpg)`, async () => {
      const result = await getFluidGatsbyImage(assetPathPng, {toFormat: ImageFormat.Jpg})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with fit set to (fill)`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg, {fit: ImageFit.Fill})
      expect(result).toMatchSnapshot()
    })

    it(`generates a new aspect ratio of 1 when fit is set to (fill) and max height and max width are (800)`, async () => {
      const result = await getFluidGatsbyImage(assetPathJpg, {
        fit: ImageFit.Fill,
        maxHeight: 800,
        maxWidth: 800,
      })
      expect(result?.aspectRatio).toEqual(1)
    })

    it(`throws when the assetPath is bad`, async () => {
      await expect(getFluidGatsbyImage(assetPathBad)).rejects.toThrow(
        `Could not get image dimensions for ${assetPathBad}`,
      )
    })

    it(`returns custom breakpoints when defined`, async () => {
      const breakpoints = [100, 500]
      const result = await getFluidGatsbyImage(assetPathJpg, {
        srcSetBreakpoints: breakpoints,
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const srcSet = result?.srcSet.split(`,\n`).map((src) => +src.match(/(\d+)w$/)![1])
      expect(srcSet).toEqual(breakpoints)
    })
  })

  describe(`when requesting a fixed image`, () => {
    beforeAll(() => {
      rimraf.sync(`${CACHE_ASSETS_FOLDER}/*`)
    })

    it(`matches snapshot for jpg with no parameters`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg)
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200)`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg, {width: 1200})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200) and max height (768)`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg, {width: 1200, height: 768})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with toFormat set to (png)`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg, {toFormat: ImageFormat.Png})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for png with toFormat set to (jpg)`, async () => {
      const result = await getFixedGatsbyImage(assetPathPng, {toFormat: ImageFormat.Jpg})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with fit set to (fill)`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg, {fit: ImageFit.Fill})
      expect(result).toMatchSnapshot()
    })

    it(`generates a new aspect ratio of 1 when fit is set to (fill) and max height and max width are (800)`, async () => {
      const result = await getFixedGatsbyImage(assetPathJpg, {
        fit: ImageFit.Fill,
        height: 800,
        width: 800,
      })
      expect(result?.aspectRatio).toEqual(1)
    })

    it(`maintains the original aspect ratio when only a height is specified`, async () => {
      const result1 = await getFixedGatsbyImage(assetPathJpg)
      const result2 = await getFixedGatsbyImage(assetPathJpg, {
        height: 400,
      })

      expect(result1?.aspectRatio).toEqual(result2?.aspectRatio)
    })

    it(`throws when the assetPath is bad`, async () => {
      await expect(getFixedGatsbyImage(assetPathBad)).rejects.toThrow(
        `Could not get image dimensions for ${assetPathBad}`,
      )
    })
  })

  describe(`when it downloads asset data`, () => {
    it(`can cache the results`, async () => {
      const fileName = `test-file.json`
      const fileData = `test data`

      await cacheSet(fileName, fileData)
      const cachedData = await cacheGet(fileName)
      expect(cachedData).toEqual(fileData)
    })
  })
})
