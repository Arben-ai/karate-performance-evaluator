<script>
	import NavBar from '$lib/NavBar.svelte';

	export let data;
	const list = data?.evaluations || [];

	const formatDate = (d) => {
		try {
			const date = new Date(d);
			if (Number.isNaN(date.getTime())) return d || '—';
			return date.toLocaleDateString('de-CH');
		} catch {
			return d || '—';
		}
	};
</script>

<div class="app-shell">
	<NavBar active="overview" />

	<main class="page container">
		<header class="page-header">
			<div>
				<h1>Übersicht Bewertungen</h1>
				<p class="muted">Zeigt die letzten Einträge aus MongoDB (Collection "evaluations")</p>
			</div>
			<a class="btn primary" href="/bewertung">Neue Bewertung erfassen</a>
		</header>

		{#if list.length === 0}
			<div class="empty card">
				<h3>Noch keine Bewertungen</h3>
				<p>Lege die erste Bewertung an, um sie hier zu sehen.</p>
				<a class="btn ghost" href="/bewertung">Jetzt erstellen</a>
			</div>
		{:else}
			<section class="grid">
				{#each list as ev}
					<article class="card">
						<div class="top">
							<div>
								<div class="pill">{ev.discipline || '—'}</div>
								<h3>{ev.athlete || ev.name || 'Unbekannt'}</h3>
								<p class="muted">{ev.coach || 'Coach'}</p>
							</div>
							<div class="score">{ev.score ?? '—'}</div>
						</div>
						<div class="meta">
							<span>{formatDate(ev.date)}</span>
							<span>{ev.badge || ''}</span>
						</div>
						{#if ev.text || ev.comment}
							<p class="comment">{ev.text || ev.comment}</p>
						{/if}
						{#if ev.details && ev.details.length}
							<div class="details">
								{#each ev.details as d}
									<div class="detail">
										<div class="label">{d.label}</div>
										<div class="value">{d.value}</div>
									</div>
								{/each}
							</div>
						{/if}
					</article>
				{/each}
			</section>
		{/if}
	</main>
</div>

<style>
	:global(body){background:#f7f8fb;}
	.page.container{max-width:1200px;margin:24px auto;padding:0 20px;display:flex;flex-direction:column;gap:16px}
	.page-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
	h1{margin:0;font-size:26px;font-weight:700}
	.muted{margin:4px 0 0;color:#6b7280;font-size:14px}
	.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-weight:600;text-decoration:none;border:1px solid transparent;cursor:pointer}
	.btn.primary{background:#e11d2f;color:#fff;border-color:#e11d2f}
	.btn.primary:hover{box-shadow:0 8px 18px rgba(225,29,47,0.25)}
	.btn.ghost{background:#fff;border:1px solid #e5e7eb;color:#111}

	.card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 8px 18px rgba(15,23,36,0.05);padding:16px}
	.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
	.top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
	.pill{display:inline-block;background:#eef1f5;padding:4px 10px;border-radius:999px;font-size:12px;color:#111;border:1px solid #e2e6ec;margin-bottom:6px}
	.score{font-size:28px;font-weight:800;color:#0f1724}
	.meta{display:flex;gap:10px;font-size:13px;color:#6b7280;margin:6px 0 10px}
	.comment{margin:0 0 10px;color:#1f2937;font-size:14px;line-height:1.45}
	.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
	.detail{background:#f8fafc;border:1px solid #eef2f6;border-radius:8px;padding:8px}
	.detail .label{color:#6b7280;font-size:12px}
	.detail .value{font-weight:700}
	.empty{text-align:center;padding:28px}

	@media (max-width: 720px){
		.page-header{align-items:flex-start}
		.btn.primary{width:100%;justify-content:center}
		.details{grid-template-columns:1fr}
	}
</style>
