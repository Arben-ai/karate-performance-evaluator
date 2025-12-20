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

	$: lastEval = myEvals[0] || null;
	$: avgScore = (() => {
		const scores = myEvals.map((ev) => Number(ev?.score)).filter((v) => Number.isFinite(v));
		if (!scores.length) return '-';
		const sum = scores.reduce((a, b) => a + b, 0);
		return Math.round(sum / scores.length);
	})();
	$: bestScore = (() => {
		const scores = myEvals.map((ev) => Number(ev?.score)).filter((v) => Number.isFinite(v));
		return scores.length ? Math.max(...scores) : '-';
	})();
	$: totalEvals = myEvals.length;
	$: lastDiscipline = lastEval?.discipline || 'Noch keine Disziplin erfasst';
	$: lastCoach = lastEval?.coach || activeOption?.coach || 'Coach noch nicht hinterlegt';
	$: disciplineStats = (() => {
		const map = new Map();
		for (const ev of myEvals) {
			const key = normalizeKey(ev?.discipline) || 'allgemein';
			const existing = map.get(key) || {
				name: ev?.discipline || 'Allgemein',
				sum: 0,
				count: 0,
				best: null,
				lastScore: ev?.score ?? null,
				lastDate: ev?.createdAt || ev?.date
			};
			const score = Number(ev?.score);
			if (Number.isFinite(score)) {
				existing.sum += score;
				existing.count += 1;
				existing.best = existing.best === null ? score : Math.max(existing.best, score);
				existing.lastScore = ev?.score ?? existing.lastScore;
				existing.lastDate = ev?.createdAt || ev?.date || existing.lastDate;
			}
			map.set(key, existing);
		}
		return Array.from(map.values())
			.map((v) => ({
				...v,
				avg: v.count ? Math.round(v.sum / v.count) : 0
			}))
			.sort((a, b) => b.avg - a.avg);
	})();
	$: nextSteps = (() => {
		const steps = [];
		if (!myEvals.length) {
			return [
				'Bitte deinen Coach um eine erste Bewertung, um dein Dashboard zu füllen.',
				'Trage deine nächste Trainingseinheit ein, damit Fortschritte sichtbar werden.'
			];
		}
		const weakest = disciplineStats[disciplineStats.length - 1];
		if (typeof avgScore === 'number' && avgScore < 80) {
			steps.push('Ziel: Durchschnitt in den nächsten 4 Wochen um 5 Punkte steigern.');
		}
		if (weakest?.name) {
			steps.push(`Fokus auf ${weakest.name}: zusätzliche Technik-Einheit mit dem Coach planen.`);
		}
		if (lastEval?.comment) {
			steps.push('Letztes Feedback nochmals prüfen und konkrete Übungen ableiten.');
		}
		return steps.slice(0, 3);
	})();
</script>

<div class="app-shell">
	<NavBar role="athlete" active="dashboard" />

	<main class="page container">
		<header class="page-header">
			<div>
				<p class="eyebrow">Athlet</p>
				<h1>Hallo, {activeOption?.label || 'Athlet'}</h1>
				<p class="muted">
					Dein persönliches Performance-Dashboard mit den neuesten Bewertungen und Trends.
				</p>
			</div>
		</header>

		<section class="stat-grid">
			<div class="card stat">
				<div class="stat-label">Durchschnitt</div>
				<div class="stat-value">{avgScore}</div>
				<div class="stat-sub">Letzte {totalEvals || 0} Bewertungen</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Beste Bewertung</div>
				<div class="stat-value">{bestScore}</div>
				<div class="stat-sub">{lastDiscipline}</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Letzte Einheit</div>
				<div class="stat-value">{lastEval?.score ?? '-'}</div>
				<div class="stat-sub">
					{lastEval ? `${formatDate(lastEval.date || lastEval.createdAt)} · ${lastDiscipline}` : 'Noch keine Einträge'}
				</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Coach</div>
				<div class="stat-value">{lastCoach}</div>
				<div class="stat-sub">{activeOption?.discipline || 'Disziplin offen'}</div>
			</div>
		</section>

		<section class="grid-two">
			<div class="card recent">
				<div class="card-head">
					<h3>Letzte Bewertungen</h3>
					<span class="pill">{totalEvals}</span>
				</div>
				{#if myEvals.length === 0}
					<p class="muted">Noch keine Bewertungen vorhanden.</p>
				{:else}
					<div class="eval-list">
						{#each myEvals.slice(0, 4) as ev (ev.id)}
							<div class="eval-item">
								<div class="eval-left">
									<div class="eval-avatar">{(ev.athlete || '?')[0]}</div>
									<div>
										<div class="eval-name">{ev.discipline || 'Disziplin'}</div>
										<div class="eval-meta">
											{formatDate(ev.date || ev.createdAt)} · {ev.coach || 'Coach'}
										</div>
									</div>
								</div>
								<div class="eval-score">
									<div class="score-value">{ev.score ?? '-'}</div>
									<div class="score-badge {badgeForScore(ev.score, ev.badge, ev.badgeTone).tone}">
										{badgeForScore(ev.score, ev.badge, ev.badgeTone).label}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="card focus">
				<div class="card-head">
					<h3>Disziplin-Fokus</h3>
					<span class="pill subtle">{disciplineStats.length} Bereiche</span>
				</div>
				{#if disciplineStats.length === 0}
					<p class="muted">Sobald Bewertungen vorliegen, siehst du hier deine Schwerpunkte.</p>
				{:else}
					{#each disciplineStats.slice(0, 4) as disc (disc.name)}
						<div class="disc-row">
							<div class="disc-head">
								<div>
									<div class="disc-name">{disc.name}</div>
									<div class="disc-meta">{disc.count || 0} Bewertungen</div>
								</div>
								<div class="disc-score">{disc.avg} / 100</div>
							</div>
							<div class="progress">
								<span style={`width:${Math.max(6, Math.min(100, disc.avg || 0))}%`}></span>
							</div>
							<div class="disc-meta">
								Letzter Score {disc.lastScore ?? '-'} · {formatDate(disc.lastDate)}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>

		<section class="grid-two">
			<div class="card goals">
				<div class="card-head">
					<h3>Nächste Schritte</h3>
					<span class="pill subtle">Personalisiert</span>
				</div>
				{#if nextSteps.length === 0}
					<p class="muted">Keine Vorschläge verfügbar.</p>
				{:else}
					<ul>
						{#each nextSteps as step, i}
							<li><span class="step-index">{i + 1}</span> {step}</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="card profile">
				<div class="card-head">
					<h3>Profil &amp; Coach</h3>
					<span class="pill subtle">Überblick</span>
				</div>
				<div class="profile-grid">
					<div>
						<div class="label">Disziplin</div>
						<div class="value">{activeOption?.discipline || 'Noch nicht hinterlegt'}</div>
					</div>
					<div>
						<div class="label">Kyu / Dan</div>
						<div class="value">{activeOption?.rank || '-'}</div>
					</div>
					<div>
						<div class="label">Coach</div>
						<div class="value">{lastCoach}</div>
					</div>
					<div>
						<div class="label">Letzte Aktivität</div>
						<div class="value">
							{lastEval ? formatDate(lastEval.date || lastEval.createdAt) : 'Noch keine Daten'}
						</div>
					</div>
				</div>
				{#if lastEval?.comment}
					<div class="coach-note">
						<div class="label">Feedback</div>
						<p>{lastEval.comment}</p>
					</div>
				{:else}
					<p class="muted">Sobald Feedback erfasst wird, erscheint es hier.</p>
				{/if}
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
	.stat .stat-sub{color:#6b7280;font-size:13px}
	.grid-two{display:grid;grid-template-columns:2fr 1.1fr;gap:16px;margin-bottom:16px}
	.card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
	.card-head h3{margin:0;font-size:17px}
	.pill{display:inline-flex;align-items:center;justify-content:center;background:#0f1724;color:#fff;border-radius:999px;padding:6px 10px;font-weight:700;font-size:12px}
	.pill.subtle{background:#f3f4f6;color:#111;border:1px solid #e6e9ee}

	.eval-list{display:flex;flex-direction:column;gap:10px}
	.eval-item{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #eef1f5;border-radius:12px;background:#f8fafc}
	.eval-left{display:flex;align-items:center;gap:12px}
	.eval-avatar{width:42px;height:42px;border-radius:50%;background:#0f1724;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
	.eval-name{font-weight:700}
	.eval-meta{color:#6b7280;font-size:13px}
	.eval-score{text-align:right}
	.score-value{font-weight:800;font-size:18px}
	.score-badge{font-size:12px;padding:4px 8px;border-radius:8px;font-weight:700;display:inline-block;margin-top:4px}
	.score-badge.green{background:#e7f6ec;color:#187246}
	.score-badge.blue{background:#e7f1fb;color:#1d4ed8}
	.score-badge.yellow{background:#fef3c7;color:#92400e}
	.score-badge.red{background:#fde2e1;color:#b42318}
	.score-badge.gray{background:#f3f4f6;color:#4b5563}

	.focus .disc-row{padding:10px 0;border-bottom:1px solid #eef1f5}
	.focus .disc-row:last-child{border-bottom:0}
	.disc-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
	.disc-name{font-weight:700}
	.disc-meta{color:#6b7280;font-size:12px;margin-top:2px}
	.disc-score{font-weight:800}
	.progress{background:#f3f4f6;border-radius:999px;height:8px;overflow:hidden;margin:8px 0}
	.progress span{display:block;height:100%;background:#e11d2f;border-radius:999px}

	.goals ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
	.goals li{display:flex;gap:10px;align-items:flex-start}
	.step-index{width:26px;height:26px;border-radius:8px;background:#0f1724;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-top:2px}

	.profile-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
	.label{color:#6b7280;font-size:12px;margin-bottom:4px}
	.value{font-weight:700}
	.coach-note{margin-top:12px;padding:12px;border-radius:10px;background:#f8fafc;border:1px solid #e8ebf0}

	@media (max-width:1000px){
		.stat-grid{grid-template-columns:repeat(2,1fr)}
		.grid-two{grid-template-columns:1fr}
	}
	@media (max-width:700px){
		.container{padding:0 12px}
		.stat-grid{grid-template-columns:1fr}
		.page-header h1{font-size:22px}
		.profile-grid{grid-template-columns:1fr}
	}
</style>
