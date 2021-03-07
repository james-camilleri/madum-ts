import type { Point } from '../types'
import type SvgTile from './svg-tile'

export default class CollisionMap {
  private readonly map: Array<Array<Set<SvgTile>>>
  private readonly lastCol: number
  private readonly lastRow: number
  private readonly resolution: number

  constructor (width: number, height: number, resolution = 10) {
    this.resolution = resolution
    this.map = []

    // Maximum indices for rows/columns.
    this.lastCol = Math.floor(width / this.resolution) - 1
    this.lastRow = Math.floor(height / this.resolution) - 1

    for (let i = 0; i <= this.lastCol; i++) {
      this.map.push([])

      for (let j = 0; j <= this.lastRow; j++) {
        this.map[i][j] = new Set()
      }
    }
  }

  /**
   * Converts the given vector point to a (column, row) index in the map.
   * Indices will be clamped to the map region.
   * @param point The point to convert to an index.
   *
   * @returns An { x, y } coordinate in the collision map.
   */
  index (point: Point): Point {
    const x = clamp(Math.floor(point.x / this.resolution), 0, this.lastCol)
    const y = clamp(Math.floor(point.y / this.resolution), 0, this.lastRow)

    return { x, y }
  }

  /**
   * Adds an SvgTile to the collision map.
   * @param tile The tile to add to the map.
   */
  add (tile: SvgTile): void {
    const clientRectangle = tile.clientRectangle()
    const topLeft = this.index(clientRectangle[0])
    const bottomRight = this.index(clientRectangle[2])

    // Add a reference to the given tile to every cell it covers.
    for (let i = topLeft.x; i <= bottomRight.x; i++) {
      for (let j = topLeft.y; j <= bottomRight.y; j++) {
        this.map[i][j].add(tile)
      }
    }
  }

  /**
   * Get a list of all the tiles the current tile may be in collision with.
   * @param tile An SvgTile to test for overlaps.
   *
   * @returns An array of SvgTiles to test for collisions.
   */
  getOverlapping (tile: SvgTile): SvgTile[] {
    const overlapping = new Set<SvgTile>()
    const clientRectangle = tile.clientRectangle()
    const topLeft = this.index(clientRectangle[0])
    const bottomRight = this.index(clientRectangle[2])

    // Add all tiles in the current cell to the set of overlapping tiles.
    for (let i = topLeft.x; i <= bottomRight.x; i++) {
      for (let j = topLeft.y; j <= bottomRight.y; j++) {
        const cell = this.map[i][j].values()
        for (const tile of cell) {
          overlapping.add(tile)
        }
      }
    }

    return [...overlapping]
  }
}

/**
 * Clamps a number to a minimum/maximum value.
 * @param n The number to clamp.
 * @param min The lower bound to clamp to.
 * @param max The upper bound to clamp to.
 *
 * @returns The original number if between min & max, the min value if it is
 * lower than that, or the max value if it is larger than that.
 */
function clamp (n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
