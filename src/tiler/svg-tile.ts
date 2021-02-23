import * as SAT from 'sat'

import { Point, TileConfig, Transformations } from '../types'
import * as collision from '../utils/collision'
import * as svg from '../utils/svg'
import createCache, { Cache } from './cached-value'

export default class SvgTile {
  public svg: SVGGraphicsElement

  public boundingBox: Cache<SAT.Vector[]>
  public clientRectangle: Cache<SAT.Vector[]>
  public pathPoints: Cache<DOMPoint[]>
  public collisionPaths: Cache<Point[][]>

  // Used for debugging / drawing collision zones.
  private readonly bBoxOutline: SVGPathElement
  private readonly clientRectOutline: SVGPathElement
  private readonly collisionOutline: SVGPathElement
  private collisionOutlinePoints: SVGElement

  private readonly width: number
  private readonly height: number
  private readonly centre: { x: number, y: number }

  public transformations: {
    scale?: {
      string: string
      value: number
    }
    rotate?: {
      string: string
      value: number
    }
    translate?: {
      string: string
      value: {
        x: number
        y: number
      }
    }
  }

  public readonly options: TileConfig

  private readonly transformFunctions = {
    scale: (scale: number) => {
      const { x, y } = this.centre
      // See https://css-tricks.com/transforms-on-svg-elements/#scaling.
      return `translate(${x} ${y}) scale(${scale}) translate(-${x} -${y})`
    },

    rotate: (angle: number) => {
      const { x, y } = this.centre
      return `rotate(${angle} ${x} ${y})`
    },

    translate: ({ x, y }) => {
      const { x: centreX, y: centreY } = this.centre
      return `translate(${x - centreX} ${y - centreY})`
    }
  }

  constructor (path: string, parent: SVGElement, options: Partial<TileConfig>) {
    this.svg = createSvgElement(path)
    parent.appendChild(this.svg)

    this.options = {
      debug: false,
      padding: 5,
      distanceBetweenPoints: 7,
      ...options
    }

    const boundingBox = this.svg.getBBox()
    this.width = boundingBox.width
    this.height = boundingBox.height
    this.centre = { x: this.width / 2, y: this.height / 2 }
    this.transformations = {}

    this.clientRectangle = createCache(getClientRect.bind(this))
    this.boundingBox = createCache(getBoundingBox.bind(this))
    this.pathPoints = createCache(getPathPoints.bind(this))
    this.collisionPaths = createCache(getCollisionPaths.bind(this))

    if (this.options.debug) {
      const debugGroup = svg.createElement('g', {
        class: 'debug'
      }) as SVGPathElement

      this.clientRectOutline = (svg.createElement('path', {
        stroke: 'yellow',
        fill: 'none',
        opacity: 0.7,
        'stroke-width': 2
      }) as SVGPathElement)
      debugGroup.appendChild(this.clientRectOutline)

      this.bBoxOutline = (svg.createElement('path', {
        stroke: 'orange',
        fill: 'none',
        opacity: 0.7,
        'stroke-width': 2
      }) as SVGPathElement)
      debugGroup.appendChild(this.bBoxOutline)

      this.collisionOutline = (svg.createElement('path', {
        stroke: 'red',
        fill: 'none',
        opacity: 0.7,
        'stroke-width': 2
      }) as SVGPathElement)
      debugGroup.appendChild(this.collisionOutline)

      this.collisionOutlinePoints = svg.createElement('g')
      debugGroup.appendChild(this.collisionOutlinePoints)

      this.svg.parentElement?.appendChild(debugGroup)
    }
  }

  public intersects (external: SvgTile): boolean {
    const origin = new SAT.Vector()
    const bBox = new SAT.Polygon(
      origin,
      this.boundingBox().map(({ x, y }) => new SAT.Vector(x, y))
    )
    const externalBBox = new SAT.Polygon(
      origin,
      external.boundingBox().map(({ x, y }) => new SAT.Vector(x, y))
    )

    // Test bounding boxes using Separating Axis Theorem.
    if (!SAT.testPolygonPolygon(bBox, externalBBox)) { return false }

    // Carry out complex polygon check.
    const paths = this.collisionPaths()
    const externalPaths = external.collisionPaths()

    for (const externalPath of externalPaths) {
      for (const path of paths) {
        if (
          collision.polygonIntersect(path, externalPath) ||
          collision.polygonIntersect(externalPath, path)
        ) { return true }
      }
    }

    return false
  }

  // Simple 2d rectangle collision detection, as in
  // developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  public inBounds (bounds: Point[]): boolean {
    const clientRect = this.clientRectangle()

    return (
      clientRect[0].x < bounds[1].x &&
      clientRect[1].x > bounds[0].x &&
      clientRect[0].y < bounds[3].y &&
      clientRect[3].y > bounds[0].y
    )
  }

  // Convenience methods for transformations. Chainable.
  public scale (scale: number): this { return this.transform({ scale }) }
  public rotate (rotate: number): this { return this.transform({ rotate }) }

  public translate (
    xParam: { x: number, y: number } | number,
    yParam?: number
  ): this {
    if (yParam != null) {
      return this.transform({
        translate: {
          x: xParam as number,
          y: yParam
        }
      })
    }

    const translate = xParam as { x: number, y: number }
    return this.transform({ translate })
  }

  public translateRelative (
    translate: { x: number, y: number } | number,
    yParam?: number
  ): this {
    const currentX = this.transformations?.translate?.value.x ?? 0
    const currentY = this.transformations?.translate?.value.y ?? 0

    if (yParam != null) {
      return this.transform({
        translate: { x: currentX + (translate as number), y: currentY + yParam }
      })
    }
    return this.transform({
      translate: {
        x: currentX + (translate as { x: number, y: number }).x,
        y: currentY + (translate as { x: number, y: number }).y
      }
    })
  }

  /**
   * Scale the SVG so that its width/height is equal to the given value.
   * @param length The length the SVG path is to be scaled to.
   */
  public scaleTo (length: number): this {
    const currentLength = Math.max(this.width, this.height)
    const scale = length / currentLength

    return this.transform({ scale })
  }

  public scaleRelative (scale: number): this {
    const currentScale = this?.transformations?.scale?.value ?? 1

    return this.transform({ scale: currentScale * scale })
  }

  public transform (transformations: Transformations = {}): this {
    Object.entries(transformations).forEach(([transformation, value]) => {
      // Don't process invalid transformations.
      if (!['scale', 'translate', 'rotate'].includes(transformation)) { return }

      const transformed = this.transformFunctions[transformation](value)
      this.transformations[transformation] = { value, string: transformed }
    })

    // The order these are concatenated in is important.
    const translate = this.transformations?.translate?.string ?? ''
    const rotate = this.transformations?.rotate?.string ?? ''
    const scale = this.transformations?.scale?.string ?? ''
    const transformString = `${translate} ${rotate} ${scale}`

    // Update SVG path and mark for refresh.
    this.svg.setAttribute('transform', transformString)
    this.hasBeenTransformed()

    if (this.options.debug) {
      this.clientRectOutline
        .setAttribute('d', svg.pointsToSvgPath(this.clientRectangle()))

      this.bBoxOutline
        .setAttribute('d', svg.pointsToSvgPath(this.boundingBox()))

      const collisionPaths = this.collisionPaths()
      const d = collisionPaths.map(svg.pointsToSvgPath).join(' ')
      this.collisionOutline.setAttribute('d', d)

      this.collisionOutlinePoints.innerHTML = ''
      collisionPaths
        .flat()
        .map(({ x, y }) => svg.createElement('circle', {
          cx: x,
          cy: y,
          r: 2,
          fill: 'red',
          opacity: 0.7
        })).forEach(circle => this.collisionOutlinePoints.appendChild(circle))
    }

    // Return reference to tile for chaining.
    return this
  }

  // Mark the existing paths as dirty for recalculation if necessary.
  hasBeenTransformed (): void {
    this.boundingBox.dirty = true
    this.collisionPaths.dirty = true
    this.clientRectangle.dirty = true
  }
}

/**
 * Creates a new SVGPoint in the parent SVG's space.
 * @param param0
 * @param parentSvg
 */
function createSvgPoint ({ x, y }, parentSvg): SVGPoint {
  const point = parentSvg.createSVGPoint()
  point.x = x
  point.y = y

  return point
}

function getBoundingBox (this: SvgTile): SAT.Vector[] {
  const ownerSvg = this.svg.ownerSVGElement
  const { x, y, width, height } = this.svg.getBBox()
  const ctm = this.svg.getCTM()

  // This should never happen, but you know. Just in case.
  if (ctm == null) return []

  const points = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height }
  ]

  // Create an SVG point for each coordinate, transform the point in
  // in the parent SVG space, and create a new SAT Vector.
  const boundingBox = points.map(point => {
    const { x, y } = createSvgPoint(point, ownerSvg).matrixTransform(ctm)

    return new SAT.Vector(x, y)
  })

  return padPoints(boundingBox, this.options.padding)
}

function getClientRect (this: SvgTile): SAT.Vector[] {
  const ownerSvg = this.svg.ownerSVGElement

  const boundingBox = this.boundingBox()
  const extrema = {
    x: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
    y: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
  }

  boundingBox.forEach(({ x, y }) => {
    if (x < extrema.x.min) { extrema.x.min = x }
    if (y < extrema.y.min) { extrema.y.min = y }
    if (x > extrema.x.max) { extrema.x.max = x }
    if (y > extrema.y.max) { extrema.y.max = y }
  })

  const points = [
    { x: extrema.x.min, y: extrema.y.min },
    { x: extrema.x.max, y: extrema.y.min },
    { x: extrema.x.max, y: extrema.y.max },
    { x: extrema.x.min, y: extrema.y.max }
  ]

  // Create an SVG point for each coordinate and create a new SAT Vector.
  return points.map(point => {
    const { x, y } = createSvgPoint(point, ownerSvg)

    return new SAT.Vector(x, y)
  })
}

function getPathPoints (this: SvgTile): DOMPoint[][] {
  const paths = this.svg.nodeName === 'g'
    ? [...this.svg.children] as SVGGraphicsElement[]
    : [this.svg]

  let pointDistance = this.options.distanceBetweenPoints

  return paths.map((path: SVGPathElement) => {
    const scale = this?.transformations?.scale?.value ?? 1
    const length = path.getTotalLength() * scale
    let numberOfPoints = Math.floor(length / pointDistance)

    // Enforce a minimum number of points to ensure that small shapes
    // (such as the tittle on a j) have adequate collision path coverage.
    if (numberOfPoints < 10) {
      numberOfPoints = 10
      pointDistance = length / numberOfPoints
    }

    const points: DOMPoint[] = []
    for (let i = 0; i < numberOfPoints; i++) {
      const point = path.getPointAtLength(pointDistance / scale * i)
      points.push(createSvgPoint(point, path.ownerSVGElement))
    }

    return points
  })
}

function getCollisionPaths (): SAT.Vector[][] {
  const paths = this.pathPoints()
  const ctm = this.svg.getCTM()

  return paths.map((path: DOMPoint[]) => {
    const collisionPath = path.map(point => {
      const { x, y } = point.matrixTransform(ctm)
      return new SAT.Vector(x, y)
    })

    return padPoints(collisionPath, this.options.padding)
  })
}

function padPoints (points: SAT.Vector[], padding: number): SAT.Vector[] {
  // Cross product of two vectors.
  const cross =
    ({ x: x1, y: y1 }, { x: x2, y: y2 }): number => (x1 * y2) - (y1 * x2)

  return points.map((point, i) => {
    // if (i !== 0 && i !== 1 ) return point

    const prev = i === 0 ? points[points.length - 1] : points[i - 1]
    const next = i === points.length - 1 ? points[0] : points[i + 1]

    // Create new Vectors relative to the current point.
    const v1: SAT.Vector = new SAT.Vector(prev.x - point.x, prev.y - point.y)
    const v2: SAT.Vector = new SAT.Vector(next.x - point.x, next.y - point.y)

    // Calculate the angle between the two vectors
    // in what is apparently the recommended way.
    // Convert negative angles to their positive counterparts.
    let angleBetween = Math.atan2(cross(v1, v2), v1.dot(v2))
    if (angleBetween < 0) { angleBetween += Math.PI * 2 }

    // Calculate angle next point.
    // (Invert the y coordinate since the SVG's y axis heads "down".)
    // Convert negative angles to their positive counterparts.
    let nextAngle = Math.atan2(-v2.y, v2.x)
    if (nextAngle < 0) { nextAngle += Math.PI * 2 }

    // Calculate the x/y coordinates of a point midway
    // between the previous and next points.
    const x = padding * Math.cos(nextAngle + (angleBetween / 2))
    const y = -padding * Math.sin(nextAngle + (angleBetween / 2))

    // Return a new vector as updating the original
    // will affect subsequent calculations.
    return (new SAT.Vector(point.x, point.y)).add(new SAT.Vector(x, y))
  })
}

function createSvgElement (path: string): SVGGraphicsElement {
  const subPaths = svg.splitComplexPath(path)

  if (subPaths.length === 1) {
    return svg.createElement('path', { d: subPaths[0] })
  }

  const group = svg.createElement('g')
  subPaths.forEach(path => {
    group.appendChild(svg.createElement('path', { d: path }))
  })

  return group
}
