<script lang='ts'>
  interface Option {
    text: string
    value: string | number
  }

  export let disabled: boolean = false
  export let hint: string = ''
  export let label: string = ''
  export let options: Option[]   = []
  export let value: string | number

  const id = label.replaceAll(' ', '-').toLowerCase() + '-'
    + (Math.random() * 1000).toFixed(0).toString()
</script>

<div class='control-group'>
  <label for={id}>{label}</label>
  {#if hint}
    <span class='hint'>{hint}</span>
  {/if}
  <div class='row'>
    <select class='control' bind:value {disabled}>
      {#each options as option}
        <option value={option.value}>{option.text}</option>
      {/each}
    </select>
  </div>
</div>
