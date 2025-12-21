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

	const ageCategory = (age) => {
		const num = Number(age);
		if (!Number.isFinite(num)) return null;
		if (num < 16) return 'youth';
		if (num >= 16 && num <= 18) return 'cadets';
		if (num >= 19 && num <= 21) return 'juniors';
		if (num > 21) return 'elite';
		return null;
	};

	const categoryLabels = {
		youth: 'Youth',
		cadets: 'Cadets',
		juniors: 'Juniors',
		elite: 'Elite'
	};
	const extractImprovement = (text) => {
		const raw = (text || '').toString().trim();
		if (!raw) return '';
		const normalized = raw.toLowerCase().replace(/[.!?]+$/g, '').trim();
		const noNotePatterns = [
			/^keine\s+anmerkungen$/i,
			/^keine\s+bemerkungen$/i,
			/^keine\s+hinweise?$/i,
			/^keine\s+kommentare?$/i,
			/^nichts?\s+anzumerken$/i,
			/^ohne\s+anmerkungen?$/i
		];
		if (noNotePatterns.some((pattern) => pattern.test(normalized))) return '';
		const match = raw.match(/verbesserungsvorschlag\s*:\s*(.+)/i);
		if (match?.[1]) return match[1].trim();
		const fallback = raw.match(/verbesserung\s*:\s*(.+)/i);
		if (fallback?.[1]) return fallback[1].trim();
		return raw;
	};

	const splitSuggestions = (text) =>
		(text || '')
			.split(/(?:\r?\n|;)/)
			.map((part) => part.replace(/^[-*\d.\s]+/, '').trim())
			.filter(Boolean);

	const buildNextStepsFromFeedback = (suggestion, discipline, coachName) => {
		const chunks = splitSuggestions(suggestion);
		const focus = chunks[0] || suggestion;
		const extra = chunks[1];
		const steps = [];
		steps.push(
			`Fokus im ${discipline || 'Training'}: ${focus}. Trainiere das 2x pro Woche (je 30-45 Min) in 3 Serien a 5 Wiederholungen.`
		);
		if (extra) {
			steps.push(
				`Zusatzpunkt: ${extra}. Baue pro Einheit mindestens 2 Korrekturen ein und notiere, was besser klappt.`
			);
		} else {
			steps.push(
				'Setze dir ein klares Messziel (z.B. sauberer Ablauf ohne Unterbruch) und prüfe es am Ende jeder Einheit.'
			);
		}
		steps.push(
			`Plane eine kurze Technik-Session mit ${coachName || 'deinem Hauptcoach'} und lass dir gezielt Feedback geben.`
		);
		return steps;
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
	$: topPerformers = (() => {
		const bestByAthlete = new Map();
		for (const ev of mergedEvals || []) {
			const key = normalizeKey(ev?.athlete || ev?.name);
			if (!key) continue;
			const score = Number(ev?.score);
			if (!Number.isFinite(score)) continue;
			const current = bestByAthlete.get(key);
			const evTs = ts(ev?.date || ev?.createdAt);
			const curTs = current ? ts(current?.date || current?.createdAt) : -Infinity;
			if (!current || score > (current?.score ?? 0) || (score === (current?.score ?? 0) && evTs > curTs)) {
				bestByAthlete.set(key, ev);
			}
		}
		return Array.from(bestByAthlete.values())
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 3);
	})();
	$: topPerformerKeys = new Set(
		topPerformers.map((ev) => normalizeKey(ev?.athlete || ev?.name)).filter(Boolean)
	);
	$: isTopPerformer =
		!!activeOption?.label && topPerformerKeys.has(normalizeKey(activeOption?.label));
	const currentYear = new Date().getFullYear();
	$: athletesByKey = (() => {
		const map = new Map();
		for (const ath of athletes || []) {
			const key = normalizeKey(ath?.athlete || ath?.name);
			if (!key || map.has(key)) continue;
			map.set(key, ath);
		}
		return map;
	})();
	$: activeCategory = ageCategory(activeOption?.age);
	$: categoryEvals = mergedEvals.filter((ev) => {
		const stamp = ts(ev?.createdAt || ev?.date);
		if (!stamp || new Date(stamp).getFullYear() !== currentYear) return false;
		const key = normalizeKey(ev?.athlete || ev?.name);
		if (!key) return false;
		const ath = athletesByKey.get(key);
		if (!ath) return false;
		return activeCategory && ageCategory(ath?.age) === activeCategory;
	});
	$: categoryAvgScore = (() => {
		const scores = categoryEvals.map((ev) => Number(ev?.score)).filter((v) => Number.isFinite(v));
		if (!scores.length) return '-';
		const sum = scores.reduce((a, b) => a + b, 0);
		return Math.round(sum / scores.length);
	})();
	$: categoryEvalCount = categoryEvals.length;
	$: categoryLabel = activeCategory ? categoryLabels[activeCategory] : 'Alterskategorie';
	$: currentScore = Number.isFinite(Number(lastEval?.score)) ? Number(lastEval?.score) : '-';
	$: totalEvals = myEvals.length;
	$: lastDiscipline = lastEval?.discipline || 'Noch keine Disziplin erfasst';
	$: lastCoach = activeOption?.coach || lastEval?.coach || 'Coach noch nicht hinterlegt';
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
		if (!myEvals.length) {
			return [
				'Bitte deinen Coach um eine erste Bewertung, um dein Dashboard zu füllen.',
				'Trage deine nächste Trainingseinheit ein, damit Fortschritte sichtbar werden.'
			];
		}
		const feedbackText = lastEval?.comment || lastEval?.text || '';
		const improvement = extractImprovement(feedbackText);
		if (improvement) {
			return buildNextStepsFromFeedback(improvement, lastDiscipline, lastCoach).slice(0, 3);
		}
		const steps = [];
		const weakest = disciplineStats[disciplineStats.length - 1];
		if (typeof avgScore === 'number' && avgScore < 80) {
			steps.push('Ziel: Durchschnitt in den nächsten 4 Wochen um 5 Punkte steigern.');
		}
		if (weakest?.name) {
			steps.push(`Fokus auf ${weakest.name}: zusätzliche Technik-Einheit mit dem Coach planen.`);
		}
		if (lastEval?.comment || lastEval?.text) {
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
				{#if isTopPerformer}
					<span class="pill top-performer">
						<span class="crown" aria-hidden="true">
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6l4 4 5-6 5 6 4-4"></path>
								<path d="M4 14h16"></path>
								<path d="M5 14l1.5 6h11L19 14"></path>
							</svg>
						</span>
						Top Performer
					</span>
				{/if}
				<p class="muted">
					Dein persönliches Performance-Dashboard mit den neuesten Bewertungen und Trends.
				</p>
			</div>
		</header>

		<section class="stat-grid">
			<div class="card stat">
				<div class="stat-label">Kategorie-Schnitt</div>
				<div class="stat-value">{categoryAvgScore}</div>
				<div class="stat-sub">Ø aller {categoryLabel}-Bewertungen {currentYear} · {categoryEvalCount} Einträge</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Aktuelle Bewertung</div>
				<div class="stat-value">{currentScore}</div>
				<div class="stat-sub">{lastDiscipline}</div>
			</div>
			<div class="card stat">
				<div class="stat-label">Hauptcoach</div>
				<div class="stat-value">{lastCoach}</div>
				<div class="stat-sub">{activeOption?.discipline || 'Disziplin offen'}</div>
			</div>
		</section>

		<section class="grid-two">
			<div class="card recent">
				<div class="card-head">
					<h3>Letzte Bewertungen</h3>
					<span class="pill">4</span>
				</div>
				{#if myEvals.length === 0}
					<p class="muted">Noch keine Bewertungen vorhanden.</p>
				{:else}
					<div class="eval-list">
						{#each myEvals.slice(0, 4) as ev, i (ev.id)}
							<div class="eval-item reveal-item" style={`--delay:${i}`}>
								<div class="eval-left">
									<div class="eval-avatar">{(ev.athlete || '?')[0]}</div>
									<div>
										<div class="eval-name">{ev.discipline || 'Disziplin'}</div>
										<div class="eval-meta">
											{formatDate(ev.date || ev.createdAt)} - {ev.coach || 'Coach'}
										</div>
									</div>
								</div>
								<div class="eval-score">
									<div class="score-value">{ev.score ?? '-'}</div>
									<div
										class={`score-badge ${badgeForScore(ev.score, ev.badge, ev.badgeTone).tone} ${badgeForScore(ev.score, ev.badge, ev.badgeTone).label === 'Sehr gut' ? 'glow' : ''}`}
									>
										{badgeForScore(ev.score, ev.badge, ev.badgeTone).label}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="card goals">
				<div class="card-head">
					<h3>Nächste Schritte</h3>
					<span class="pill subtle">Personalisiert</span>
				</div>
				{#if nextSteps.length === 0}
					<p class="muted">Keine Vorschläge verfügbar.</p>
				{:else}
					<ol class="steps">
						{#each nextSteps as step, i}
							<li class="step reveal-item" style={`--delay:${i}`}>
								<span class="step-index">{i + 1}</span>
								<div class="step-body">
									<div class="step-title">Schritt {i + 1}</div>
									<div class="step-text">{step}</div>
								</div>
							</li>
						{/each}
					</ol>
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

	.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0 24px}
	.card{background:#fff;border:1px solid #e8ebf0;border-radius:12px;padding:16px;box-shadow:0 8px 18px rgba(15,23,36,0.04)}
	.stat .stat-label{color:#6b7280;font-size:13px}
	.stat .stat-value{font-size:26px;font-weight:800;margin:6px 0}
	.stat .stat-sub{color:#6b7280;font-size:13px}
	.grid-two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
	.card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
	.card-head h3{margin:0;font-size:17px}
	.pill{display:inline-flex;align-items:center;justify-content:center;background:#e11d2f;color:#fff;border-radius:999px;padding:6px 10px;font-weight:700;font-size:12px}
	.pill.subtle{background:#f3f4f6;color:#111;border:1px solid #e6e9ee}
	.pill.top-performer{margin-top:6px;gap:6px}
	.pill .crown{display:inline-flex;align-items:center;justify-content:center}

	.eval-list{display:flex;flex-direction:column;gap:10px}
	.eval-item{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #eef1f5;border-radius:12px;background:#f8fafc}
	.eval-left{display:flex;align-items:center;gap:12px}
	.eval-avatar{width:42px;height:42px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
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
	.score-badge.glow{
		animation:badgeGlow 2200ms ease-in-out infinite;
		box-shadow:0 0 0 rgba(14,168,84,0);
	}

	@keyframes badgeGlow{
		0%{box-shadow:0 0 0 rgba(14,168,84,0)}
		50%{box-shadow:0 10px 22px rgba(14,168,84,0.25)}
		100%{box-shadow:0 0 0 rgba(14,168,84,0)}
	}

	@media (prefers-reduced-motion: reduce){
		.score-badge.glow{animation:none}
	}


	.steps{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
	.step{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid #eef1f5;border-radius:12px;background:#f8fafc}
	.step-index{width:30px;height:30px;border-radius:9px;background:#e11d2f;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;margin-top:2px;flex:0 0 30px}
	.step-body{display:flex;flex-direction:column;gap:4px}
	.step-title{font-weight:700;font-size:13px;color:#0f1724;text-transform:uppercase;letter-spacing:.06em}
	.step-text{color:#111827;font-size:14px;line-height:1.4}

	.reveal-item{
		opacity:0;
		transform:translateY(18px);
		animation:cardReveal 520ms ease forwards;
		animation-delay:calc(var(--delay, 0) * 90ms);
	}

	@keyframes cardReveal{
		from{opacity:0;transform:translateY(18px)}
		to{opacity:1;transform:translateY(0)}
	}

	@media (prefers-reduced-motion: reduce){
		.reveal-item{animation:none;opacity:1;transform:none}
	}


	@media (max-width:1000px){
		.stat-grid{grid-template-columns:repeat(2,1fr)}
		.grid-two{grid-template-columns:1fr}
	}
	@media (max-width:700px){
		.container{padding:0 12px}
		.stat-grid{grid-template-columns:1fr}
		.page-header h1{font-size:22px}
	}
</style>




