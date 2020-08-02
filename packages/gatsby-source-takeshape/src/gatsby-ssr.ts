import {createElement} from 'react'
import {RenderBodyArgs} from 'gatsby'

export const onRenderBody = ({setHeadComponents}: RenderBodyArgs): void => {
  setHeadComponents([
    createElement(`link`, {
      rel: `preconnect`,
      key: `takeshape-images-preconnect`,
      href: `https://images.takeshape.io`,
    }),
  ])
}
