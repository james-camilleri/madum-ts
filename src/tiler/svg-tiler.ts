import { Point } from '../types'
import * as random from '../utils/random'
import * as svg from '../utils/svg'
import CollisionMap from './collision-map'
import ScaleSequence from './scale-sequence'
import SvgTile from './svg-tile'

const spirals = {
  // Archimedean spiral based off code from Jason Davies' d3-cloud.
  // https://github.com/jasondavies/d3-cloud
  archimedean: (width, height) => {
    const e = width / height

    return pos => ({
      x: e * (pos *= 0.1) * Math.cos(pos),
      y: pos * Math.sin(pos)
    })
  },

  // Based off a comment on a reddit coding challenge here:
  // https://www.reddit.com/r/dailyprogrammer/comments/3ggli3/
  // 20150810_challenge_227_easy_square_spirals/ctycb0r/
  // I'm going to be honest, I have no idea how this works.
  rectangular: (width, height) => {
    const dy = 10
    const dx = dy * width / height

    return pos => {
      const m = Math.floor((Math.sqrt(pos) + 1) / 2)
      const k = pos - 4 * m * (m - 1)
      let x, y

      if (k <= 2 * m) {
        x = m
        y = k - m
      } else if (k <= 4 * m) {
        x = 3 * m - k
        y = m
      } else if (k <= 6 * m) {
        x = -m
        y = 5 * m - k
      } else {
        x = k - 7 * m
        y = -m
      }

      return { x: x * dx, y: y * dy }
    }
  }
}

export default class SvgTiler {
  private readonly svg: SVGGraphicsElement
  private readonly paths: string[]

  private config: Config

  private width: number
  private height: number
  private longestSide: number
  private readonly scaleSequence: ScaleSequence

  private origin: Point
  private bounds: Point[]

  private collisionMap: CollisionMap
  private tiles: {
    placed: SvgTile[]
    outOfBounds: SvgTile[]
    failed: number
  }

  private time: {
    start: number
    total: number
  }

  private highlight: {
    applied: boolean
    threshold: number
  }

  private spiral: (pos: number) => Point

  constructor (svgElement: SVGGraphicsElement, paths: string[]) {
    this.svg = svgElement
    this.paths = paths
    this.scaleSequence = new ScaleSequence()
  }

  init (config: Partial<Config>): void {
    this.config = {
      size: {
        width: 500,
        height: 500
      },
      spiral: 'archimedean',
      tiles: {
        startCount: 1,
        startSize: 66,
        scaleRatio: 'golden',
        scaleFrequency: 'triple',
        maxLevels: 5,
        padding: 5,
        rotationIncrement: 15,
        wiggle: 5
      },
      stopConditions: {
        maxTiles: 1000,
        maxTime: 60
      },
      colours: {
        background: '#ffffff',
        foreground: '#ffffff',
        highlight: '#ef7d00'
      },
      twoPass: false,

      debug: false,
      log: false,
      ...config
    }

    this.width = this.config.size.width
    this.height = this.config.size.height
    this.longestSide = Math.max(this.width, this.height)
    this.svg.setAttribute('width', `${this.width}px`)
    this.svg.setAttribute('height', `${this.height}px`)

    const overflow = this.config.debug ? 'visible' : 'hidden'
    document.documentElement.style.setProperty('--svg-overflow', overflow)

    const {
      startCount,
      scaleRatio,
      scaleFrequency,
      maxLevels
    } = this.config.tiles
    this.scaleSequence.init(startCount, scaleRatio, scaleFrequency, maxLevels)

    // Start pattern randomly in the centre third of the canvas.
    this.origin = {
      x: random.integerBetween(this.width / 3, (this.width / 3) * 2),
      y: random.integerBetween(this.height / 3, (this.height / 3) * 2)
    }

    // Outer bounds of canvas. Tiles are discarded beyond this point.
    this.bounds = [
      { x: this.width * -0.01, y: this.height * -0.01 },
      { x: this.width * 1.01, y: this.height * -0.01 },
      { x: this.width * 1.01, y: this.height * 1.01 },
      { x: this.width * -0.01, y: this.height * 1.01 }
    ]

    this.tiles = {
      placed: [],
      outOfBounds: [],
      failed: 0
    }
    this.collisionMap = new CollisionMap(this.width, this.height)

    this.spiral = spirals[this.config.spiral](this.width, this.height)

    this.time = {
      start: 0,
      total: 0
    }

    this.highlight = {
      applied: false,
      threshold: 0.01
    }

    // Draw outer bounds of canvas id debug mode is enabled.
    if (this.config.debug) {
      const bounds = svg.createElement('path', {
        stroke: 'yellow',
        fill: 'none',
        'stroke-width': 2,
        d: svg.pointsToSvgPath(this.bounds)
      }) as SVGPathElement
      this.svg.appendChild(bounds)
    }
  }

  tile (): void {
    this.clear()
    this.time.start = Date.now()

    this.placeTile()
  }

  private cleanUp (): void {
    this.tiles.outOfBounds.forEach(tile => {
      this.svg.removeChild(tile.svg)
    })
  }

  private clear (): void {
    // Clear existing elements.
    while (this.svg.lastChild != null) {
      this.svg.removeChild(this.svg.lastChild)
    }
  }

  private stop (): boolean {
    return this.tiles.placed.length >= this.config.stopConditions.maxTiles ||
      this.time.total >= this.config.stopConditions.maxTime
  }

  private placeTile (): void {
    const startSize = (this.config.tiles.startSize / 100) * this.longestSide

    window.requestAnimationFrame(() => {
      const wiggle = this.config.tiles.wiggle
      const size = startSize * this.scaleSequence.next()
      const rotation = random.rotation(this.config.tiles.rotationIncrement)
      const options = {
        padding: this.config.tiles.padding,
        debug: this.config.debug
      }

      const tile = new SvgTile(random.fromArray(this.paths), this.svg, options)
        .scaleTo(random.wiggle(size, wiggle))
        .rotate(random.wiggle(rotation, wiggle))
        .translate(this.origin)

      tile.svg.classList.add('tile')

      // tile.svg.setAttribute('fill', '#ffffff');
      // tile.svg.setAttribute('stroke', '#ffffff');
      // tile.svg.setAttribute('stroke', '#000000');

      let collision = true
      let spiralPosition = 0
      let inBounds = tile.inBounds(this.bounds)

      while (collision && inBounds) {
        collision = false

        const position = this.spiral(spiralPosition)
        tile.translateRelative(position)

        const tilesToTest = this.collisionMap.getOverlapping(tile)

        for (const externalTile of tilesToTest) {
          collision = tile.intersects(externalTile)
          if (collision) { break }
        }

        inBounds = tile.inBounds(this.bounds)
        spiralPosition += random.integerBetween(50, 200)
      }

      if (inBounds) {
        this.tiles.placed.push(tile)
        this.collisionMap.add(tile)
        this.tiles.failed = 0

        // Randomly highlight a single tile orange,
        // if no tiles have been painted yet.
        const rand = Math.random()
        if (!this.highlight.applied && (rand < this.highlight.threshold)) {
          tile.svg.setAttribute('fill', this.config.colours.highlight)
          this.highlight.applied = true
        } else {
          this.highlight.threshold *= 1.1
        }
      } else {
        this.tiles.outOfBounds.push(tile)
        this.tiles.failed++

        if (this.tiles.failed >= 50) {
          this.scaleSequence.shift()
          this.tiles.failed = 0
        }
      }

      this.time.total = (Date.now() - this.time.start) / 1000

      if (this.stop()) {
        console.log('time', this.time.total)
        console.log('tiles', this.tiles.placed.length)
        this.cleanUp()

        if (this.config.twoPass) {
          this.tiles.placed.forEach(tile => this.growTile(tile))
        }

        return
      }

      this.placeTile()
    })
  }

  private growTile (tile: SvgTile): void {
    let collision = false

    while (!collision) {
      tile.scaleRelative(1.02)
      const tilesToTest = this.collisionMap.getOverlapping(tile)
        .filter(tileToTest => tileToTest !== tile)

      for (const externalTile of tilesToTest) {
        collision = tile.intersects(externalTile)

        // Revert scale if collision is created.
        if (collision) {
          tile.scaleRelative(0.98)
          break
        }
      }
    }
  }
}

interface Config {
  size: {
    width: number
    height: number
  }
  spiral: string
  tiles: {
    startCount: number
    startSize: number
    scaleRatio: string
    scaleFrequency: string
    maxLevels: number
    padding: number
    rotationIncrement: number
    wiggle: number
  }
  stopConditions: {
    maxTiles: number
    maxTime: number
  }
  colours: {
    background: string
    foreground: string
    highlight: string
  }
  twoPass: boolean
  debug: boolean
  log: boolean
}
