<script>
	export let tone = 'gray';
	export let label = '';

	const colors = {
		green: { bg: '#ecfdf3', fg: '#166534', border: '#bbf7d0' },
		blue: { bg: '#eff6ff', fg: '#1d4ed8', border: '#bfdbfe' },
		red: { bg: '#fef2f2', fg: '#991b1b', border: '#fecaca' },
		gray: { bg: '#f3f4f6', fg: '#374151', border: '#e5e7eb' }
	};

	$: c = colors[tone] || colors.gray;
</script>

<span class="badge" style={`background:${c.bg};color:${c.fg};border-color:${c.border}`}>
	{#if label}{label}{:else}<slot />{/if}
</span>

<style>
	.badge{display:inline-flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:999px;border:1px solid;font-weight:700;font-size:12px;line-height:1}
</style>
