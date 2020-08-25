import {GatsbyCache} from 'gatsby'
import {getFluidGatsbyImage, getFixedGatsbyImage, imgixClient} from '../gatsby-image-tools'
import {ImageFormat, ImageFit} from '../../types/images'

// Since it's easier to work with imgix fixtures, we'll override the domain
const IMGIX_DOMAIN = `assets.imgix.net`

const assetPathJpg = `unsplash/pineneedles.jpg`
const assetPathPng = `examples/lorie.png`
const assetPathBad = `examples/some-bad-path.jpg`

describe(`gatsby image utils`, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(imgixClient as any).settings.domain = IMGIX_DOMAIN

  const cache: GatsbyCache = {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve(null)),
  }

  describe(`when requesting a fluid image`, () => {
    it(`matches snapshot for jpg with no parameters`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg)
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {maxWidth: 1200})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200) and max height (768)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {
        maxWidth: 1200,
        maxHeight: 768,
      })
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with toFormat set to (png)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {toFormat: ImageFormat.Png})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for png with toFormat set to (jpg)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathPng, {toFormat: ImageFormat.Jpg})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with fit set to (fill)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {fit: ImageFit.Fill})
      expect(result).toMatchSnapshot()
    })

    it(`generates a new aspect ratio of 1 when fit is set to (fill) and max height and max width are (800)`, async () => {
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {
        fit: ImageFit.Fill,
        maxHeight: 800,
        maxWidth: 800,
      })
      expect(result?.aspectRatio).toEqual(1)
    })

    it(`throws when the assetPath is bad`, async () => {
      await expect(getFluidGatsbyImage({cache}, assetPathBad)).rejects.toThrow(
        `Could not get image dimensions for ${assetPathBad}`,
      )
    })

    it(`returns custom breakpoints when defined`, async () => {
      const breakpoints = [100, 500]
      const result = await getFluidGatsbyImage({cache}, assetPathJpg, {
        srcSetBreakpoints: breakpoints,
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const srcSet = result?.srcSet.split(`,\n`).map((src) => +src.match(/(\d+)w$/)![1])
      expect(srcSet).toEqual(breakpoints)
    })
  })

  describe(`when requesting a fixed image`, () => {
    it(`matches snapshot for jpg with no parameters`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg)
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg, {width: 1200})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200) and max height (768)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg, {width: 1200, height: 768})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with toFormat set to (png)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg, {toFormat: ImageFormat.Png})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for png with toFormat set to (jpg)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathPng, {toFormat: ImageFormat.Jpg})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with fit set to (fill)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg, {fit: ImageFit.Fill})
      expect(result).toMatchSnapshot()
    })

    it(`generates a new aspect ratio of 1 when fit is set to (fill) and max height and max width are (800)`, async () => {
      const result = await getFixedGatsbyImage({cache}, assetPathJpg, {
        fit: ImageFit.Fill,
        height: 800,
        width: 800,
      })
      expect(result?.aspectRatio).toEqual(1)
    })

    it(`maintains the original aspect ratio when only a height is specified`, async () => {
      const result1 = await getFixedGatsbyImage({cache}, assetPathJpg)
      const result2 = await getFixedGatsbyImage({cache}, assetPathJpg, {
        height: 400,
      })

      expect(result1?.aspectRatio).toEqual(result2?.aspectRatio)
    })

    it(`throws when the assetPath is bad`, async () => {
      await expect(getFixedGatsbyImage({cache}, assetPathBad)).rejects.toThrow(
        `Could not get image dimensions for ${assetPathBad}`,
      )
    })
  })
})
