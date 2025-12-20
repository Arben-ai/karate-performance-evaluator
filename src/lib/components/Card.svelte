<script>
	export let title = '';
	export let subtitle = '';
	export let href = '';
	export let body = '';
</script>

<article class="card">
	{#if title || subtitle}
		<header class="card-header">
			<div>
				{#if title}<h3>{title}</h3>{/if}
				{#if subtitle}<p>{subtitle}</p>{/if}
			</div>
			{#if href}
				<a class="link" href={href}>Mehr</a>
			{/if}
		</header>
	{/if}
	<div class="card-body">
		<slot>{body}</slot>
	</div>
</article>

<style>
	.card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 8px 18px rgba(15,23,36,0.05);padding:16px}
	.card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
	h3{margin:0;font-size:18px}
	p{margin:4px 0 0;color:#6b7280;font-size:14px}
	.link{font-weight:600;color:#e11d2f;text-decoration:none}
	.link:hover{text-decoration:underline}
	.card-body{display:flex;flex-direction:column;gap:8px}
</style>
