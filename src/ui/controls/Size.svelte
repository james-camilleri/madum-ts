<script>
  export let size
  export let disabled = false
</script>

<div class='control-group'>
  <label for='width'>Canvas size</label>
  <span class='hint'>
    This produces SVGs, so the actual size is not so important,
    just make sure your ratio makes sense.
  </span>
  <div class='row'>
    <div class='row'>
      <input
        {disabled}
        class='control'
        id='width'
        max='2000'
        min='100'
        type='number'
        bind:value={size.x}
      />
      <span><em>px</em></span>
    </div>
    <span><strong>x</strong></span>
    <div class='row'>
      <input
        {disabled}
        class='control'
        id='height'
        max='2000'
        min='100'
        type='number'
        bind:value={size.y}
      />
      <span><em>px</em></span>
    </div>
  </div>
</div>
