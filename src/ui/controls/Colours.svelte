<script lang='ts'>
  export let colours = {
    background: '',
    foreground: '',
    highlight: ''
  }

  // Colour pickers a bit weird and I
  // don't feel like typing this properly.
  const updateColour  = (e: any, colour: string) => {
    colours[colour] = e.target.value
  }
</script>

<div class='section'>
  <div class='control-group'>
    <div class='row'>
      <label for='backgroundColour'>Background</label>
      <input
        on:change={e => updateColour(e, 'background')}
        class='control'
        id='backgroundColour'
        type='color'
        value={colours.background}
      >
    </div>
  </div>
  <div class='control-group'>
    <div class='row'>
      <label for='foregroundColour'>Foreground</label>
      <input
        on:change={e => updateColour(e, 'foreground')}
        class='control'
        id='foregroundColour'
        type='color'
        value={colours.foreground}
      >
    </div>
  </div>
  <div class='control-group'>
    <div class='row'>
      <label for='highlightColour'>Highlight</label>
      <input
        on:change={e => updateColour(e, 'highlight')}
        class='control'
        id='highlightColour'
        type='color'
        value={colours.highlight}
      >
    </div>
  </div>
</div>
