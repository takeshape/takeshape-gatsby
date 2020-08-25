import {useEffect, useState} from 'react'
import {getFixedGatsbyImage, getFluidGatsbyImage} from 'gatsby-source-takeshape'

export function useFixedImage(assetPath) {
  const [result, setResult] = useState([])

  useEffect(async () => {
    const fluidImage = await getFixedGatsbyImage(assetPath)
    setResult(fluidImage)
  }, [assetPath])

  return [result]
}

export function useFluidImage(assetPath) {
  const [result, setResult] = useState([])

  useEffect(async () => {
    const fluidImage = await getFluidGatsbyImage(assetPath)
    setResult(fluidImage)
  }, [assetPath])

  return [result]
}
