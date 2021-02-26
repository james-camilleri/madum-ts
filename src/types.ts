export interface Point {
  x: number
  y: number
}

export interface TileConfig {
  debug: boolean
  padding: number
  distanceBetweenPoints: number
}

export interface Transformations {
  scale?: number
  rotate?: number
  translate?: {
    x: number
    y: number
  }
}

export interface SvgAttributes {
  [attr: string]: string | number
}

export interface Status { tilesPlaced: number, totalTime: number }

export interface Config {
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
  onStatusUpdate?: (status: Status) => void
}
