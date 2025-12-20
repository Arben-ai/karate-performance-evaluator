<script>
  import { onMount } from 'svelte';

  export let options = [];
  export let placeholder = 'Auswählen...';
  export let value = '';
  export let disabled = false;

  let open = false;
  let root;

  const labelFor = (val) => options.find((o) => o.value === val)?.label ?? '';
  $: selectedLabel = labelFor(value);
  $: showPlaceholder = !selectedLabel;

  function toggle() {
    if (disabled) return;
    open = !open;
  }

  function choose(val) {
    value = val;
    open = false;
  }

  function handleOutside(e) {
    if (!root) return;
    if (!root.contains(e.target)) open = false;
  }

  onMount(() => {
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  });
</script>

<div class="combo" bind:this={root} data-open={open}>
  <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded={open} on:click={toggle} disabled={disabled}>
    <span class:placeholder={showPlaceholder}>{selectedLabel || placeholder}</span>
    <span class="chevron">{open ? '▲' : '▼'}</span>
  </button>
  {#if open}
    <div class="panel">
      <ul role="listbox">
        {#each options as opt (opt.value)}
          <li>
            <button type="button" class:selected={opt.value === value} on:click={() => choose(opt.value)}>
              {opt.label}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .combo{position:relative}
  .trigger{
    width:100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:12px 14px;
    border-radius:10px;
    border:1px solid #e5e7eb;
    background:#f7f8fb;
    font-size:15px;
    cursor:pointer;
  }
  .trigger:disabled{opacity:0.6;cursor:default}
  .placeholder{color:#9ca3af}
  .chevron{font-size:12px;color:#6b7280}
  .panel{
    position:absolute;
    top:calc(100% + 6px);
    left:0;
    right:0;
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:10px;
    box-shadow:0 12px 24px rgba(15,23,36,0.12);
    z-index:25;
    max-height:240px;
    overflow:hidden;
  }
  ul{list-style:none;margin:0;padding:6px 0;max-height:240px;overflow:auto}
  li button{
    width:100%;
    padding:10px 14px;
    border:0;
    background:#fff;
    text-align:left;
    font-size:14px;
    cursor:pointer;
  }
  li button:hover{background:#f5f7fb}
  li button.selected{background:#eef2ff;font-weight:700}
</style>
