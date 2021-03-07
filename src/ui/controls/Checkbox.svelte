<script lang='ts'>
  export let checked: boolean
  export let disabled = false
  export let hint: string = ''
  export let label: string = ''

  const id = label.replaceAll(' ', '-').toLowerCase() + '-'
    + (Math.random() * 1000).toFixed(0).toString()
</script>

<div class='control-group --checkbox'>
  <div class='row'>
    <label for={id}>{label}</label>
    <input
      {disabled}
      bind:checked
      class='control'
      id={id}
      type='checkbox'
    >
  </div>
  {#if hint}
    <span class='hint'>{hint}</span>
  {/if}
</div>
