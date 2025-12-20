<script>
	import { onDestroy, onMount } from 'svelte';
	import NavBar from '$lib/NavBar.svelte';
	import { evaluations as evaluationStore, normalizeEval } from '$lib/stores/evaluations';
	import { activeAthlete } from '$lib/stores/activeAthlete';
	import {
		badgeForScore,
		buildAthleteOptions,
		dedupeEvaluations,
		findAthleteOption,
		normalizeKey,
		ts
	} from '$lib/utils/athleteView';

	export let data;

	const formatDate = (value) => {
		try {
			const d = new Date(value);
			if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('de-CH');
		} catch {
			/* ignore */
		}
		return value || '';
	};

	let athletes = data?.athletes || [];
	let serverEvals = (data?.evaluations || []).map(normalizeEval);
	let clientEvals = [];
	let mergedEvals = [];
	let athleteOptions = [];
	let selectedAthlete = '';
	let activeOption = null;
	let myEvals = [];
	let evalUnsub;
	let activeUnsub;
	let syncedSelection = false;

	onMount(() => {
		evalUnsub = evaluationStore.subscribe((list) => {
			clientEvals = (list || []).map(normalizeEval);
		});
		activeUnsub = activeAthlete.subscribe((value) => {
			if (value) {
				selectedAthlete = value;
				syncedSelection = true;
			}
		});
	});

	onDestroy(() => {
		evalUnsub?.();
		activeUnsub?.();
	});

	$: mergedEvals = dedupeEvaluations([...serverEvals, ...clientEvals]);
	$: athleteOptions = buildAthleteOptions(athletes, mergedEvals);
	$: activeOption = (() => {
		const match = findAthleteOption(athleteOptions, selectedAthlete);
		return match || null;
	})();

	$: if (!syncedSelection && selectedAthlete) {
		activeAthlete.set(selectedAthlete);
		syncedSelection = true;
	}

	$: myEvals = mergedEvals
		.slice()
		.filter((ev) => normalizeKey(ev.athlete || ev.name) === normalizeKey(activeOption?.label))
		.sort((a, b) => ts(b?.createdAt || b?.date) - ts(a?.createdAt || a?.date));

	$: avgScore = (() => {
		const scores = myEvals.map((ev) => Number(ev?.score)).filter((v) => Number.isFinite(v));
		if (!scores.length) return '-';
		const sum = scores.reduce((a, b) => a + b, 0);
		return Math.round(sum / scores.length);
	})();
	$: trendDelta = myEvals.length >= 2 ? Number(myEvals[0]?.score || 0) - Number(myEvals[1]?.score || 0) : null;
	$: lastDate = myEvals[0]?.date || myEvals[0]?.createdAt || null;
	$: disciplineInsights = (() => {
		const map = new Map();
		for (const ev of myEvals) {
			const key = normalizeKey(ev?.discipline) || 'allgemein';
			const score = Number(ev?.score);
			const entry = map.get(key) || { name: ev?.discipline || 'Allgemein', scores: [], last: ev };
			if (Number.isFinite(score)) entry.scores.push(score);
			entry.last =
				entry.last && ts(ev?.createdAt || ev?.date) < ts(entry.last?.createdAt || entry.last?.date)
					? entry.last
					: ev;
			map.set(key, entry);
		}
		return Array.from(map.values())
			.map((v) => ({
				name: v.name,
				avg: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : '-',
				best: v.scores.length ? Math.max(...v.scores) : '-',
				count: v.scores.length,
				lastScore: v.last?.score ?? '-',
				lastDate: v.last?.date || v.last?.createdAt
			}))
			.sort((a, b) => (Number.isFinite(b.avg) ? b.avg : 0) - (Number.isFinite(a.avg) ? a.avg : 0));
	})();
	$: strengths = disciplineInsights.slice(0, 2);
	$: focusAreas = disciplineInsights.slice(-2).reverse();
	$: timeline = myEvals.slice(0, 6).map((ev, idx, arr) => {
		const prev = arr[idx + 1];
		const delta = prev ? Number(ev.score || 0) - Number(prev.score || 0) : null;
		return { ...ev, delta };
	});
	$: comments = myEvals
		.filter((ev) => ev.comment || ev.text)
		.slice(0, 4)
		.map((ev) => ({ text: ev.comment || ev.text, date: ev.date || ev.createdAt, discipline: ev.discipline }));
</script>

<div class="app-shell">
	<NavBar role="athlete" active="analyse" />

	<main class="page container">
		<header class="page-header">
			<div>
				<p class="eyebrow">Analyse</p>
				<h1>Verlauf &amp; Insights</h1>
				<p class="muted">
					Verfolge deine Entwicklung, erkenne Stärken und Fokusthemen.
				</p>
			</div>
		</header>

		<section class="stat-grid">
			<div class="card stat">
				<div class="stat-label">Trend</div>
				<div class={`stat-value ${trendDelta && trendDelta > 0 ? 'positive' : trendDelta < 0 ? 'negative' : ''}`}>
					{trendDelta === null ? '-' : (trendDelta > 0 ? '+' : '') + trendDelta}
				</div>
				<div class="stat-sub">Letzte Veränderung</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Durchschnitt</div>
				<div class="stat-value">{avgScore}</div>
				<div class="stat-sub">{myEvals.length} Bewertungen</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Aktivität</div>
				<div class="stat-value">{myEvals.length ? 'Aktiv' : 'Noch offen'}</div>
				<div class="stat-sub">{lastDate ? formatDate(lastDate) : 'Keine Einträge'}</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Coach</div>
				<div class="stat-value">{activeOption?.coach || 'Noch offen'}</div>
				<div class="stat-sub">{activeOption?.discipline || 'Disziplin offen'}</div>
			</div>
		</section>

		<section class="grid-two">
			<div class="card">
				<div class="card-head">
					<h3>Bewertungsverlauf</h3>
					<span class="pill">{timeline.length}</span>
				</div>
				{#if timeline.length === 0}
					<p class="muted">Noch keine Bewertungen verfügbar.</p>
				{:else}
					<div class="timeline">
						{#each timeline as ev (ev.id)}
							<div class="timeline-row">
								<div>
									<div class="tl-title">{ev.discipline || 'Disziplin'}</div>
									<div class="tl-meta">{formatDate(ev.date || ev.createdAt)}</div>
								</div>
								<div class="tl-score">
									<div class="score-value">{ev.score ?? '-'}</div>
									{#if ev.delta !== null}
										<div class={`delta ${ev.delta > 0 ? 'up' : ev.delta < 0 ? 'down' : ''}`}>
											{ev.delta > 0 ? '+' : ''}{ev.delta}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="card">
				<div class="card-head">
					<h3>Coach Feedback</h3>
					<span class="pill subtle">{comments.length}</span>
				</div>
				{#if comments.length === 0}
					<p class="muted">Noch keine Kommentare erfasst.</p>
				{:else}
					<ul class="comment-list">
						{#each comments as c, idx}
							<li>
								<div class="comment-index">{idx + 1}</div>
								<div>
									<div class="comment-text">{c.text}</div>
									<div class="comment-meta">{formatDate(c.date)} · {c.discipline || 'Disziplin'}</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>

		<section class="grid-two">
			<div class="card">
				<div class="card-head">
					<h3>Disziplin-Insights</h3>
					<span class="pill subtle">{disciplineInsights.length}</span>
				</div>
				{#if disciplineInsights.length === 0}
					<p class="muted">Sobald Bewertungen vorliegen, siehst du hier deine Disziplinen.</p>
				{:else}
					<div class="insight-grid">
						{#each disciplineInsights as disc (disc.name)}
							<div class="insight">
								<div class="insight-top">
									<div>
										<div class="disc-name">{disc.name}</div>
										<div class="disc-meta">{disc.count} Bewertungen</div>
									</div>
									<div class="badge">{badgeForScore(disc.avg).label}</div>
								</div>
								<div class="insight-row">
									<span>Ø</span>
									<strong>{disc.avg}</strong>
									<span>Beste</span>
									<strong>{disc.best}</strong>
								</div>
								<div class="disc-meta">Letzte Bewertung: {formatDate(disc.lastDate)}</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="card">
				<div class="card-head">
					<h3>Stärken &amp; Fokus</h3>
					<span class="pill subtle">Insights</span>
				</div>
				<div class="split">
					<div>
						<div class="label">Stärken</div>
						{#if strengths.length === 0}
							<p class="muted">Noch keine Daten.</p>
						{:else}
							{#each strengths as s (s.name)}
								<div class="chip positive">{s.name} · Ø {s.avg}</div>
							{/each}
						{/if}
					</div>
					<div>
						<div class="label">Fokusbereiche</div>
						{#if focusAreas.length === 0}
							<p class="muted">Noch keine Daten.</p>
						{:else}
							{#each focusAreas as f (f.name)}
								<div class="chip warn">{f.name} · Ø {f.avg}</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	.container{max-width:1200px;margin:24px auto;padding:0 20px}
	.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}
	.page-header h1{margin:4px 0;font-weight:800;font-size:28px}
	.muted{color:#6b7280;margin-top:6px}
	.eyebrow{letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#9ca3af;margin:0}

	.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:18px 0 24px}
	.card{background:#fff;border:1px solid #e8ebf0;border-radius:12px;padding:16px;box-shadow:0 8px 18px rgba(15,23,36,0.04)}
	.stat .stat-label{color:#6b7280;font-size:13px}
	.stat .stat-value{font-size:26px;font-weight:800;margin:6px 0}
	.stat .stat-value.positive{color:#187246}
	.stat .stat-value.negative{color:#b42318}
	.stat .stat-sub{color:#6b7280;font-size:13px}
	.grid-two{display:grid;grid-template-columns:2fr 1.1fr;gap:16px;margin-bottom:16px}
	.card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
	.card-head h3{margin:0;font-size:17px}
	.pill{display:inline-flex;align-items:center;justify-content:center;background:#0f1724;color:#fff;border-radius:999px;padding:6px 10px;font-weight:700;font-size:12px}
	.pill.subtle{background:#f3f4f6;color:#111;border:1px solid #e6e9ee}

	.timeline{display:flex;flex-direction:column;gap:10px}
	.timeline-row{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #eef1f5;border-radius:12px;background:#f8fafc}
	.tl-title{font-weight:700}
	.tl-meta{color:#6b7280;font-size:12px}
	.tl-score{text-align:right}
	.delta{font-size:12px;margin-top:2px;color:#4b5563}
	.delta.up{color:#187246}
	.delta.down{color:#b42318}

	.comment-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
	.comment-list li{display:flex;gap:10px;align-items:flex-start;border:1px solid #eef1f5;border-radius:12px;padding:10px;background:#f9fafb}
	.comment-index{width:28px;height:28px;border-radius:8px;background:#0f1724;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-top:2px}
	.comment-text{font-weight:600}
	.comment-meta{color:#6b7280;font-size:12px;margin-top:4px}

	.insight-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
	.insight{border:1px solid #eef1f5;border-radius:12px;padding:12px;background:#f8fafc}
	.insight-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
	.disc-name{font-weight:700}
	.disc-meta{color:#6b7280;font-size:12px;margin-top:2px}
	.badge{padding:4px 8px;border-radius:8px;background:#fff;border:1px solid #e6e9ee;font-size:12px;font-weight:700}
	.insight-row{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px}

	.split{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
	.label{color:#6b7280;font-size:12px;margin-bottom:6px}
	.chip{padding:8px 10px;border-radius:10px;font-weight:700;border:1px solid #e6e9ee;margin-bottom:8px}
	.chip.positive{background:#e7f6ec;color:#187246;border-color:#c1e3ce}
	.chip.warn{background:#fef3c7;color:#92400e;border-color:#f2dd9b}

	@media (max-width:1000px){
		.stat-grid{grid-template-columns:repeat(2,1fr)}
		.grid-two{grid-template-columns:1fr}
	}
	@media (max-width:700px){
		.container{padding:0 12px}
		.stat-grid{grid-template-columns:1fr}
		.page-header h1{font-size:22px}
		.split{grid-template-columns:1fr}
	}
</style>
