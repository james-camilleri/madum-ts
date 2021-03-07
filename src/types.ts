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

export interface Status {
  tilesPlaced: number
  totalTime: string
  averageTimeToPlace: string
  scale: { ratio: number, level: number }
  isProcessing: boolean
}

export interface Config {
  size: {
    x: number
    y: number
  }
  start: {
    count: number
    size: number
  }
  scale: {
    ratio: string
    frequency: string
    strictFrequency: boolean
    maxLevels: number
  }
  tile: {
    padding: number
    rotation: number
    wiggle: number
  }
  colours: {
    background: string
    foreground: string
    highlight: string
  }
  stopConditions: {
    tiles: number
    time: number
  }
  spiral: string
  twoPass: boolean
  debug: boolean
  onStatusUpdate?: (status: Status) => void
}
