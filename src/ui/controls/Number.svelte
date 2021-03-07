<script lang='ts'>
  export let disabled = false
  export let hint: string = ''
  export let label: string = ''
  export let min: number | undefined = undefined
  export let max: number | undefined = undefined
  export let unit: string | undefined = undefined
  export let value: number

  const id = label.replaceAll(' ', '-').toLowerCase() + '-'
    + (Math.random() * 1000).toFixed(0).toString()
</script>

<div class='control-group'>
  <label for={id}>{label}</label>
  {#if hint}
    <span class='hint'>{hint}</span>
  {/if}
  <div class='row'>
    <input
      {disabled}
      class='control'
      id={id}
      max={max}
      min={min}
      type='number'
      bind:value
    >
    {#if unit}
      <em>{unit}</em>
    {/if}
  </div>
</div>
