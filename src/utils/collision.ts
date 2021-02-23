interface Point { x: number, y: number }

function pointInPolygon (point: Point, polygon: Point[]): boolean {
  let isInside = false
  let minX = polygon[0].x; let maxX = polygon[0].x
  let minY = polygon[0].y; let maxY = polygon[0].y

  for (let n = 1; n < polygon.length; n++) {
    const q = polygon[n]
    minX = Math.min(q.x, minX)
    maxX = Math.max(q.x, maxX)
    minY = Math.min(q.y, minY)
    maxY = Math.max(q.y, maxY)
  }

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false
  }

  let i = 0
  let j = polygon.length - 1
  for (i; i < polygon.length; i++) {
    if ((polygon[i].y > point.y) !== (polygon[j].y > point.y) &&
          point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) {
      isInside = !isInside
    }

    j = i
  }

  return isInside
}

function polygonIntersect (polygonA: Point[], polygonB: Point[]): boolean {
  for (const point of polygonA) {
    if (pointInPolygon(point, polygonB)) return true
  }

  return false
}

export {
  pointInPolygon,
  polygonIntersect
}
