<script>
	export let label = '';
	export let helper = '';
	export let type = 'text';
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let rows = 3;
	export let min;
	export let max;
	export let step;
</script>

<label class="field">
	<div class="head">
		<span>{label}</span>
		{#if helper}<small>{helper}</small>{/if}
	</div>
	{#if type === 'textarea'}
		<textarea
			rows={rows}
			bind:value
			placeholder={placeholder}
			{required}
		></textarea>
	{:else}
		<input
			type={type}
			bind:value
			placeholder={placeholder}
			{required}
			{min}
			{max}
			{step}
		/>
	{/if}
</label>

<style>
	.field{display:flex;flex-direction:column;gap:6px;font-weight:600;color:#111;font-size:14px}
	.head{display:flex;gap:8px;align-items:baseline}
	small{color:#6b7280;font-weight:500}
	input, textarea{width:100%;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;box-sizing:border-box}
	textarea{resize:vertical}
</style>
