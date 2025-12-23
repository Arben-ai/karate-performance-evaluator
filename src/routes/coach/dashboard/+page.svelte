<script>
	import { onMount, onDestroy } from 'svelte';
	import { evaluations } from '$lib/stores/evaluations';
	import NavBar from '$lib/NavBar.svelte';

	export let data;

	let coachName = 'Coach';
	let athletes = [];
	let evaluationList = [];
	let clientEvals = [];
	let evalUnsub;
	let athletesLoading = false;

	const normalizeName = (value) => (value || '').toString().trim().toLowerCase();

	function avatarLetter(value) {
		if (!value) return '?';
		const name = typeof value === 'string' ? value : value?.athlete || value?.name;
		const clean = (name || '').toString().trim();
		return clean ? clean[0].toUpperCase() : '?';
	}

	function athleteStats(name, evals = evaluationList) {
		const key = normalizeName(name);
		if (!key) return { lastScore: '-', evalCount: 0 };
		const matching = (evals || []).filter((ev) => normalizeName(ev?.athlete || ev?.name) === key);
		if (!matching.length) return { lastScore: '-', evalCount: 0 };

		const sorted = matching
			.slice()
			.sort((a, b) => (Date.parse(b?.date || '') || 0) - (Date.parse(a?.date || '') || 0));

		return {
			lastScore: sorted[0]?.score ?? '-',
			evalCount: matching.length
		};
	}

	$: {
		coachName = data?.coachName || 'Coach';
		// Zeige die neuesten Athleten systemweit (nicht nur je Coach), damit zuletzt hinzugefügte immer sichtbar sind.
		athletes = data?.allAthletes || data?.athletes || [];
	}

	const dedupe = (arr = []) => {
		const map = new Map();
		for (const ev of arr) {
			const key = ev?._id || ev?.id || `${ev?.athlete || ev?.name}-${ev?.discipline || ''}-${ev?.date || ''}`;
			if (!map.has(key)) map.set(key, ev);
		}
		return Array.from(map.values());
	};

	$: mergedEvaluations = dedupe([...(data?.evaluations || []), ...(clientEvals || [])]);
	$: evaluationList = mergedEvaluations;
	$: uniqueDisciplines = Array.from(new Set((evaluationList || []).map((ev) => normalizeName(ev?.discipline)))).filter(Boolean).length;

	const ts = (v, id) => {
		// Use the most recent timestamp: createdAt or ObjectId time.
		const idTs =
			id && typeof id === 'string' && id.length === 24
				? parseInt(id.substring(0, 8), 16) * 1000
				: 0;
		const dateTs = (() => {
			const t = Date.parse(v || '');
			return Number.isNaN(t) ? 0 : t;
		})();
		return Math.max(idTs || 0, dateTs || 0, 0);
	};

	$: athleteCards = (athletes || [])
		.slice()
		.sort((a, b) => ts(b?.createdAt, b?._id || b?.id) - ts(a?.createdAt, a?._id || a?.id))
		.slice(0, 4)
		.map((ath) => {
			const name = ath?.athlete || ath?.name || 'Unbekannt';
			return {
				key: ath?._id ?? name,
				name,
				discipline: ath?.discipline || '-',
				_stats: athleteStats(name, evaluationList)
			};
		});

	$: totalAthletes = (athletes || []).length;
	$: topPerformers = (() => {
		const bestByAthlete = new Map();
		for (const ev of evaluationList || []) {
			const key = normalizeName(ev?.athlete || ev?.name);
			if (!key) continue;
			const score = Number(ev?.score);
			if (!Number.isFinite(score)) continue;
			const current = bestByAthlete.get(key);
			const evTs = ts(ev?.date || ev?.createdAt, ev?._id || ev?.id);
			const curTs = current ? ts(current?.date || current?.createdAt, current?._id || current?.id) : -Infinity;
			if (!current || score > (current?.score ?? 0) || (score === (current?.score ?? 0) && evTs > curTs)) {
				bestByAthlete.set(key, ev);
			}
		}
		return Array.from(bestByAthlete.values())
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 3);
	})();

	onMount(() => {
		evalUnsub = evaluations.subscribe((val) => {
			clientEvals = val || [];
		});
		refreshAthletes();
	});

	onDestroy(() => {
		try {
			evalUnsub?.();
		} catch (e) {}
	});

	async function refreshAthletes() {
		athletesLoading = true;
		try {
			const res = await fetch(`/api/athletes`, { cache: 'no-store' });
			if (!res.ok) return;
			const fresh = await res.json();
			athletes = Array.isArray(fresh) ? fresh : [];
		} catch (e) {
			console.warn('Athletes refresh failed', e);
		} finally {
			athletesLoading = false;
		}
	}
</script>

<div class="app-shell">
	<NavBar active="dashboard" />

	<main class="container">
		<header class="page-header">
			<div>
				<p class="eyebrow">Coach Dashboard</p>
				<h1>Hallo, Coach {coachName}</h1>
				<p class="muted">Die wichtigsten Kennzahlen auf einen Blick und schnelle Actions.</p>
			</div>
		</header>

		<section class="split">
			<div class="panel actions">
				<div class="panel-head">
					<h3>Aktionen & Fokus</h3>
				</div>

				<div class="action-row">
					<a class="secondary" href="/coach/athleten">Athleten verwalten</a>
					<a class="primary" href="/coach/bewertung">Neue Bewertung</a>
					<a class="ghost" href="/coach/feedback">Feedback</a>
				</div>
			</div>

			<div class="panel top-performers">
				<div class="panel-head">
					<h3>Top Performer</h3>
					<span class="muted small">Letzte Scores</span>
				</div>
				{#if topPerformers.length === 0}
					<p class="muted small">Noch keine Bewertungen vorhanden.</p>
				{:else}
					<ul class="compact-list">
						{#each topPerformers as performer, index (performer._id ?? performer.id ?? performer.date ?? performer.athlete)}
							<li class="reveal-item" style={`--delay:${index}`}>
								<div class="avatar small">{avatarLetter(performer.athlete || performer.name)}</div>
									<div class="name-block glow-name">
										<div class="title">
											<span class="top-icon" aria-hidden="true">
												<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
													<path d="M3 6l4 4 5-6 5 6 4-4"></path>
													<path d="M4 14h16"></path>
													<path d="M5 14l1.5 6h11L19 14"></path>
												</svg>
											</span>
											{performer.athlete || performer.name || 'Unbekannt'}
										</div>
										<div class="sub">{performer.discipline || ''}</div>
									</div>
								<div class="pill-score pulse loop">{performer.score ?? '-'}</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>

		<section class="panel athletes">
			<div class="panel-head">
				<h3>Athleten-Überblick</h3>
				<a class="link subtle" href="/coach/athleten">Alle Athleten</a>
			</div>

			{#if athleteCards.length === 0}
				<div class="empty-block">
					<p class="muted">Noch keine Athleten hinzugefügt.</p>
					<a class="link" href="/coach/athleten">Athleten hinzufügen</a>
				</div>
			{:else}
				<div class="athlete-grid">
					{#each athleteCards as card (card.key)}
						<article class="athlete-card reveal-card">
							<div class="athlete-top">
								<div class="avatar">{avatarLetter(card.name)}</div>
								<div class="athlete-info">
									<div class="athlete-name">{card.name}</div>
									<div class="athlete-discipline">{card.discipline}</div>
								</div>
							</div>
							<div class="athlete-stats">
								<div>
									<div class="stat-label">Letzter Score</div>
									<div class="stat-value">{card._stats.lastScore ?? '-'}</div>
								</div>
								<div>
									<div class="stat-label">Bewertungen</div>
									<div class="stat-value">{card._stats.evalCount}</div>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	:global(body) {
		font-family:
			Inter,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial;
		margin: 0;
		background: #f6f7fb;
		color: #0f172a;
	}

	.container {
		max-width: 1180px;
		margin: 22px auto 32px;
		padding: 0 20px;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 14px;
		flex-wrap: wrap;
	}

	.eyebrow {
		margin: 0 0 6px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #9ca3af;
		font-size: 12px;
		font-weight: 700;
	}

	.page-header h1 {
		margin: 0;
		font-weight: 800;
		font-size: 28px;
		line-height: 1.1;
	}

	.muted {
		color: #6b7280;
		margin: 4px 0 0;
		font-size: 15px;
	}

	.split {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 18px;
	}

	.panel {
		background: #fff;
		border-radius: 14px;
		padding: 16px 18px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 10px 20px rgba(17, 24, 39, 0.05);
	}

	.panel.actions {
		opacity: 0;
		transform: translateX(-22px);
		animation: actionsFlyIn 560ms ease forwards;
		animation-delay: 120ms;
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 12px;
	}

	.panel h3 {
		margin: 0;
		font-size: 18px;
	}

	.link {
		color: #b91c1c;
		text-decoration: none;
		font-weight: 700;
		display: inline-flex;
		gap: 6px;
		align-items: center;
		padding: 6px 10px;
		border-radius: 10px;
		border: 1px solid #f3d2d8;
		background: #fff5f6;
	}

	.link.subtle {
		color: #0f172a;
		border-color: #e6e8ee;
		background: #f8fafc;
	}

	.action-row {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		margin-bottom: 16px;
	}

	.primary,
	.secondary,
	.ghost {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		border-radius: 12px;
		font-weight: 800;
		border: 1px solid transparent;
		transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
	}

	.primary {
		background: #e11d2f;
		color: #fff;
		box-shadow: 0 10px 20px rgba(225, 29, 47, 0.2);
	}

	.secondary {
		background: #0f172a;
		color: #fff;
	}

	.ghost {
		background: #f8fafc;
		color: #0f172a;
		border-color: #e6e8ee;
	}

	.primary:hover,
	.secondary:hover,
	.ghost:hover {
		transform: translateY(-1px);
	}

	.subsection {
		margin-top: 12px;
	}

	.subhead {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 8px;
	}

	h4 {
		margin: 0;
		font-size: 16px;
	}

	.small {
		font-size: 13px;
	}

	.compact-list {
		list-style: none;
		padding: 0;
		margin: 8px 0 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.compact-list li {
		display: grid;
		grid-template-columns: 36px minmax(0, 1fr) 72px;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid #f0f2f5;
	}

	.reveal-item {
		opacity: 0;
		transform: translateY(18px);
		animation: listReveal 520ms ease forwards;
		animation-delay: calc(var(--delay, 0) * 90ms);
	}

	.name-block .title {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 700;
	}
	.top-icon{
		color:#b91c1c;
		display:inline-flex;
		align-items:center;
		justify-content:center;
	}

	.name-block .sub {
		color: #6b7280;
		font-size: 13px;
		margin-top: 2px;
	}

	.pill-score {
		justify-self: end;
		text-align: center;
		background: #fdf2f3;
		color: #b91c1c;
		border: 1px solid #f3d2d8;
		padding: 6px 10px;
		border-radius: 10px;
		font-weight: 800;
	}

	.pill-score.pulse {
		animation: scorePulse 600ms ease forwards;
		animation-delay: calc(var(--delay, 0) * 90ms + 220ms);
	}

	.pill-score.pulse.loop {
		animation: scoreGlow 2200ms ease-in-out infinite;
		animation-delay: calc(var(--delay, 0) * 120ms + 400ms);
	}

	.glow-name .title {
		animation: nameGlow 2200ms ease-in-out infinite;
		animation-delay: calc(var(--delay, 0) * 120ms + 200ms);
	}

	@keyframes listReveal {
		from { opacity: 0; transform: translateY(18px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes actionsFlyIn {
		from { opacity: 0; transform: translateX(-22px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@keyframes scorePulse {
		0% { transform: scale(1); box-shadow: 0 0 0 rgba(225, 29, 47, 0); }
		50% { transform: scale(1.06); box-shadow: 0 8px 18px rgba(225, 29, 47, 0.18); }
		100% { transform: scale(1); box-shadow: 0 0 0 rgba(225, 29, 47, 0); }
	}

	@keyframes scoreGlow {
		0% { box-shadow: 0 0 0 rgba(225, 29, 47, 0.0); }
		50% { box-shadow: 0 10px 22px rgba(225, 29, 47, 0.25); }
		100% { box-shadow: 0 0 0 rgba(225, 29, 47, 0.0); }
	}

	@keyframes nameGlow {
		0% { text-shadow: 0 0 0 rgba(225, 29, 47, 0); color: inherit; }
		50% { text-shadow: 0 6px 18px rgba(225, 29, 47, 0.25); color: #b91c1c; }
		100% { text-shadow: 0 0 0 rgba(225, 29, 47, 0); color: inherit; }
	}

	.athletes {
		margin-top: 18px;
	}

	.athlete-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}

	.athlete-card {
		background: #f8fafc;
		border-radius: 12px;
		padding: 14px;
		border: 1px solid #e8ebf0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.athlete-card.reveal-card {
		opacity: 0;
		transform: translateY(18px);
		animation: cardReveal 520ms ease forwards;
	}

	.athlete-top {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: #e11d2f;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
		flex-shrink: 0;
	}

	.avatar.small {
		width: 36px;
		height: 36px;
		font-size: 14px;
	}

	.athlete-name {
		font-weight: 700;
		font-size: 15px;
	}

	.athlete-discipline {
		color: #6b7280;
		margin-top: 2px;
		font-size: 13px;
	}

	.athlete-stats {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	.stat-label {
		color: #6b7280;
		font-size: 13px;
	}

	.stat-value {
		font-weight: 700;
		margin-top: 4px;
		font-size: 15px;
	}

	@media (max-width: 960px) {
		.split {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 900px) {
		.action-row {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.container {
			padding: 0 14px;
		}

		.page-header h1 {
			font-size: 24px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-item,
		.panel.actions,
		.pill-score.pulse,
		.athlete-card.reveal-card {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.glow-name .title {
			animation: none;
		}
	}

	@keyframes cardReveal {
		from { opacity: 0; transform: translateY(18px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
