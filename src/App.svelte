<script lang='ts'>
  import { defaultConfig }  from './tiler/default-config'
  import type { Status } from './types'
  import * as svgUtils from './utils/svg'
  import Controls from './ui/Controls.svelte'
  import SvgTiler from './tiler/svg-tiler'
  import { onMount } from 'svelte'

  const INTRO_TEXT =
    `A utility for tiling irregular SVGs in a randomised
    pattern, using a Wordle-style algorithm.`

  // @ts-expect-error (This is a Webpack thing.)
  const svgResolver = require.context('.', false, /\.svg$/)
  const svgs = svgResolver.keys().map(key => svgResolver(key).default)
  const paths = svgs.map(svgUtils.findPaths).flat()

  let config = defaultConfig
  let configJson
  $: configJson = JSON.stringify(config, null, 2)

  let canvas
  let canvasSvg
  onMount(async () => { canvas = new SvgTiler(canvasSvg, paths) })

  const onJsonUpdate = e => {
    const jsonText = e.target.value
    try {
      config = JSON.parse(jsonText)
    } catch { } // Ignore malformed JSON.
  }

  let savedPatterns = 0
  let cancelled = false
  let disabled = false
  let showStatus = false
  let status: Status = {
    tilesPlaced: 0,
    totalTime: '0',
    averageTimeToPlace: '0',
    scale: {
      ratio: 1,
      level: 0
    },
    isProcessing: false
  }

  function onStatusChange (newStatus: Status): void {
    status = newStatus

    if (!status.isProcessing) {
      updateSaveLink(canvasSvg.outerHTML)
      disabled = false
    }
  }

  let abort
  function generate () {
    if (!canvas) return

    canvas.init({ ...config, onStatusUpdate: onStatusChange })
    abort = canvas.tile()

    cancelled = false
    disabled = true
    showStatus = true
  }

  function cancel () {
    if (typeof abort === 'function') abort()
    cancelled = true
  }

  let saveLink
  // https://www.blustemy.io/making-svg-patterns-with-javascript/
  function updateSaveLink(svg) {
    if (!saveLink) return
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = window.URL.createObjectURL(blob);

    saveLink.target = '_blank';
    saveLink.download = `tiled_pattern_${savedPatterns}.svg`;
    saveLink.href = url;
  }
</script>


<template>
  <nav class='sidebar'>
    <h1>MadumTS 🥁🐍</h1>
    <p>
      {INTRO_TEXT}
      (See <a
        href='http://static.mrfeinberg.com/bv_ch03.pdf'
        rel='nofollow'
        target='_blank'
      >Jonathan Feinberg</a>.)
    </p>

    <div class="controls">
      <Controls bind:config bind:disabled />
    </div>

    <div class='control-group'>
      <div class='button-container'>
        <button
          {disabled}
          class='control button'
          on:click={generate}
        >
          Generate
        </button>
        <a
          bind:this={saveLink}
          class:disabled={disabled}
          class='control button'
          href='#/'
          on:click={() => savedPatterns++}
        >Save
        </a>
        <button
          disabled={!disabled}
          class='control button'
          on:click={cancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </nav>

  <textarea
    {disabled}
    class='config-editor'
    on:keyup={onJsonUpdate}
    spellcheck={false}
    value={configJson}
  />

  <div class='wrapper'>
    <div class='stats-wrapper'>
      <svg
        bind:this={canvasSvg}
        id='canvas'
        width={defaultConfig.size.x}
        height={defaultConfig.size.y}>
      </svg>
      {#if showStatus}
        <div id='status'>
          <span>
            <strong>Scale: </strong>
            {status.scale.ratio.toFixed(3)}
            <sup>-{status.scale.level - 1}</sup> ({Math.pow(status.scale.ratio, -status.scale.level + 1).toFixed(3)})
          </span>
          <br>

          <span>
            <strong>Tiles placed: </strong>
            {status.tilesPlaced}
          </span>
          <br>

          <span>
            <strong>Total running time: </strong>
            {status.totalTime}s
          </span>
          <br>

          <span>
            <strong>Average time to place: </strong>
            {status.averageTimeToPlace}s
          </span>
        </div>
      {/if}
    </div>
  </div>
</template>
