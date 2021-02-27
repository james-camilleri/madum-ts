import './style.css'

import SvgTiler from './tiler/svg-tiler'
import { Status } from './types'
import * as svg from './utils/svg'

const svgResolver = require.context('.', false, /\.svg$/)
const svgs = svgResolver.keys().map(key => svgResolver(key).default)
const paths = svgs.map(svg.findPaths).flat();

(() => {
  const canvasSvg = document.querySelector('#canvas') as SVGGraphicsElement
  const statusBlock = document.querySelector('#status') as HTMLElement
  if (canvasSvg == null || statusBlock == null) return

  const canvas = new SvgTiler(canvasSvg, paths)
  const colours: Colours = {
    background: '',
    foreground: '',
    highlight: ''
  }

  setupColourPickers(colours)

  function updateStatus ({
    tilesPlaced = 0,
    totalTime = '0',
    averageTimeToPlace = '0'
  }: Status): void {
    statusBlock.innerHTML = `
      <span><strong>Tiles placed:</strong> ${tilesPlaced}</span><br>
      <span><strong>Total running time:</strong> ${totalTime}s</span><br>
      <span><strong>Average time to place:</strong> ${averageTimeToPlace}s</span>
    `
  }

  const generateButton = document.querySelector('#generate')
  generateButton?.addEventListener('click', () => {
    canvas.init({
      size: {
        width: parseInt((document.getElementById('width') as HTMLFormElement).value),
        height: parseInt((document.getElementById('height') as HTMLFormElement).value)
      },
      spiral: (document.getElementById('spiral') as HTMLFormElement).value,
      tiles: {
        startCount: (document.getElementById('startingCount') as HTMLFormElement).value,
        startSize: (document.getElementById('startingSize') as HTMLFormElement).value,
        scaleRatio: (document.getElementById('scaleRatio') as HTMLFormElement).value,
        scaleFrequency: (document.getElementById('scaleFrequency') as HTMLFormElement).value,
        maxLevels: (document.getElementById('maxLevels') as HTMLFormElement).value,
        padding: (document.getElementById('padding') as HTMLFormElement).value,
        rotationIncrement: (document.getElementById('rotation') as HTMLFormElement).value,
        wiggle: (document.getElementById('wiggle') as HTMLFormElement).value
      },
      stopConditions: {
        maxTiles: (document.getElementById('maxTiles') as HTMLFormElement).value,
        maxTime: (document.getElementById('maxTime') as HTMLFormElement).value
      },
      debug: (document.getElementById('debug') as HTMLFormElement).checked,
      log: (document.getElementById('log') as HTMLFormElement).checked,
      // colours: {
      //   background: colours.background,
      //   foreground: colours.foreground,
      //   highlight: colours.highlight
      // },
      onStatusUpdate: updateStatus
    })

    canvas.tile()
  })
})()

function setupColourPickers (colours: Colours): void {
  (document.getElementById('backgroundColour') as HTMLFormElement)
    .addEventListener('change', e => {
      console.log(e.target)
      colours.background = (e.target as any).value
    });

  (document.getElementById('foregroundColour') as HTMLFormElement)
    .addEventListener('change', e => {
      console.log(e.target)
      colours.foreground = (e.target as any).value
    });

  (document.getElementById('highlightColour') as HTMLFormElement)
    .addEventListener('change', e => {
      console.log(e.target)
      colours.highlight = (e.target as any).value
    })
}

interface Colours {
  background: string
  foreground: string
  highlight: string
}
