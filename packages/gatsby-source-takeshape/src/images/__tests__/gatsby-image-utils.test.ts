import {getFluidGatsbyImage} from '../gatsby-image-utils'
import {ImageFormat} from '../../types/images'

const assetPath = `/5fa56f55-d64e-4e56-ae68-1daf93e7fdc3/dev/84750f63-fb7a-4789-af52-1439fab79234/marion-michele-330691-unsplash.jpg`

describe(`gatsby image utils`, () => {
  describe(`when requesting a fluid image`, () => {
    it(`matches snapshot for jpg with no parameters`, async () => {
      const result = await getFluidGatsbyImage(assetPath)
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200)`, async () => {
      const result = await getFluidGatsbyImage(assetPath, {maxWidth: 1200})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with max width (1200) and max height (768)`, async () => {
      const result = await getFluidGatsbyImage(assetPath, {maxWidth: 1200, maxHeight: 768})
      expect(result).toMatchSnapshot()
    })

    it(`matches snapshot for jpg with toFormat set to (png)`, async () => {
      const result = await getFluidGatsbyImage(assetPath, {toFormat: ImageFormat.Png})
      expect(result).toMatchSnapshot()
    })
  })
})
