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
