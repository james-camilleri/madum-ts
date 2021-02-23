import { Point, SvgAttributes } from '../types'

const SVG_NS = 'http://www.w3.org/2000/svg'
const PATH_TAG_REGEX = /<path\s.*d="([\s\S]*?)"\s*[\s\S]*?\/>/g
const SIMPLE_PATH_REGEX = /[Mm][\s\S]*?[Zz]/g

function createElement (tag: string, attributes: SvgAttributes = {}): SVGGraphicsElement {
  const svgElement = document.createElementNS(SVG_NS, tag) as SVGGraphicsElement

  setAttributes(svgElement, attributes)
  return svgElement
}

function setAttributes (element: SVGElement, attributes: SvgAttributes): void {
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value as string)
  })
}

function pointsToSvgPath (points: Point[]): string {
  const pointString = points.map(({ x, y }) => `${x},${y}`)
  return `M${pointString.join()}z`
}

function findPaths (svg: string): string[] {
  const paths: string[] = []
  const matches = svg.matchAll(PATH_TAG_REGEX)

  for (const match of matches) {
    paths.push(match[1].replace(/\s+/g, ' '))
  }

  return paths
}

function splitComplexPath (pathString: string): string[] {
  const paths: string[] = []
  const matches = pathString.matchAll(SIMPLE_PATH_REGEX)

  for (const match of matches) { paths.push(match[0]) }

  return paths
}

export {
  createElement,
  pointsToSvgPath,
  findPaths,
  splitComplexPath
}
