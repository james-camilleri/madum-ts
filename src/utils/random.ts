function integerBetween (start: number, end: number): number {
  const min = Math.ceil(start)
  const max = Math.floor(end)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rotation (increment = 1): number {
  const range = Math.floor(360 / increment)
  return integerBetween(0, range) * increment
}

function fromArray<T> (array: T[]): T {
  const index = integerBetween(0, array.length - 1)
  return array[index]
}

function wiggle (value: number, percentage: number): number {
  const scale = percentage / 100
  const min = value * (1 - scale)
  const max = value * (1 + scale)

  return Math.random() * (max - min) + min
}

export {
  integerBetween,
  rotation,
  fromArray,
  wiggle
}
