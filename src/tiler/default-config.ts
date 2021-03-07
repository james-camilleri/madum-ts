import type { Config } from '../types'

export const defaultConfig: Config = {
  size: {
    x: 500,
    y: 500
  },
  start: {
    count: 1,
    size: 66
  },
  scale: {
    ratio: 'majorThird',
    frequency: 'triple',
    strictFrequency: false,
    maxLevels: 7
  },
  tile: {
    padding: 5,
    rotation: 15,
    wiggle: 5
  },
  colours: {
    background: '#ffffff',
    foreground: '#ffffff',
    highlight: '#ef7d00'
  },
  stopConditions: {
    tiles: 300,
    time: 60
  },
  spiral: 'archimedean',
  twoPass: true,
  debug: false
}
