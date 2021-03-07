<script>
  export let disabled = false
  export let maxTiles
  export let maxTime
</script>

<div class='control-group'>
  <span class='label'>Stop conditions</span>
  <span class='hint'>
    Stop processing after the maximum number of tiles have been placed or the
    maximum allowed processing time has been reached.
  </span>
  <div class='row'>
    <input
      {disabled}
      class='control'
      id='tiles'
      max='2000'
      min='1'
      type='number'
      bind:value={maxTiles}
    />
    <span aria-label='tiles'><em>tiles placed</em></span>
  </div>
</div>
<div class='control-group'>
  <div class='row'>
    <input
      {disabled}
      class='control'
      id='height'
      max='300'
      min='10'
      type='number'
      bind:value={maxTime}
    />
    <span aria-label='time'><em>seconds</em></span>
  </div>
</div>
