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
	let searchTerm = '';
	let badgeFilter = 'alle';
	let disciplineFilter = 'alle';
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

	$: disciplineOptions = Array.from(new Set(myEvals.map((f) => f?.discipline).filter(Boolean)));
	$: filteredFeedbacks = myEvals.filter((f) => {
		const term = searchTerm.trim().toLowerCase();
		const badge = badgeForScore(f.score, f.badge, f.badgeTone).label.toLowerCase();
		const matchesSearch = term
			? [f.athlete, f.coach, f.discipline, f.comment, f.text, badge].some((field) =>
					(field || '').toString().toLowerCase().includes(term)
				)
			: true;
		const matchesBadge = badgeFilter === 'alle' ? true : badge === badgeFilter.toLowerCase();
		const matchesDiscipline =
			disciplineFilter === 'alle'
				? true
				: (f.discipline || '').toString().toLowerCase() === disciplineFilter.toLowerCase();
		return matchesSearch && matchesBadge && matchesDiscipline;
	});
</script>

<div class="app-shell">
	<NavBar role="athlete" active="feedback" />

	<main class="page container">
		<header class="page-header">
			<div>
				<p class="eyebrow">Feedback</p>
				<h1>Feedback &amp; Bewertungen</h1>
				<p class="muted">
					Alle Rückmeldungen gesammelt an einem Ort – filtere nach Bedarf.
				</p>
			</div>
		</header>

		<section class="filters card">
			<input
				type="search"
				placeholder="Suche nach Disziplin, Coach oder Text"
				bind:value={searchTerm}
			/>
			<select bind:value={badgeFilter} aria-label="Nach Bewertung filtern">
				<option value="alle">Alle Bewertungen</option>
				<option value="sehr gut">Sehr gut</option>
				<option value="gut">Gut</option>
				<option value="genügend">Genügend</option>
				<option value="ungenügend">Ungenügend</option>
			</select>
			<select bind:value={disciplineFilter} aria-label="Nach Disziplin filtern">
				<option value="alle">Alle Disziplinen</option>
				{#each disciplineOptions as disc}
					<option value={disc}>{disc}</option>
				{/each}
			</select>
		</section>

		<section class="feedback-list">
			{#if filteredFeedbacks.length === 0}
				<div class="card empty">
					<p class="muted">Keine passenden Feedbacks gefunden.</p>
				</div>
			{:else}
				{#each filteredFeedbacks as fb (fb.id)}
					<article class="card feedback-card">
						<div class="card-head">
							<div>
								<div class="disc">{fb.discipline || 'Disziplin'}</div>
								<div class="meta">
									{formatDate(fb.date || fb.createdAt)} · {fb.coach || 'Coach'}
								</div>
							</div>
							<div class="score-block">
								<div class="score">{fb.score ?? '-'}</div>
								<div class={`badge ${badgeForScore(fb.score, fb.badge, fb.badgeTone).tone}`}>
									{badgeForScore(fb.score, fb.badge, fb.badgeTone).label}
								</div>
							</div>
						</div>
						{#if fb.comment || fb.text}
							<p class="comment">"{fb.comment || fb.text}"</p>
						{/if}
					</article>
				{/each}
			{/if}
		</section>
	</main>
</div>

<style>
	.container{max-width:1200px;margin:24px auto;padding:0 20px}
	.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap}
	.page-header h1{margin:4px 0;font-weight:800;font-size:28px}
	.muted{color:#6b7280;margin-top:6px}
	.eyebrow{letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#9ca3af;margin:0}

	.card{background:#fff;border:1px solid #e8ebf0;border-radius:12px;padding:16px;box-shadow:0 8px 18px rgba(15,23,36,0.04)}
	.filters{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin:18px 0}
	.filters input, .filters select{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;width:100%}

	.feedback-list{display:flex;flex-direction:column;gap:12px}
	.feedback-card .card-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
	.disc{font-weight:800;font-size:17px}
	.meta{color:#6b7280;font-size:12px;margin-top:2px}
	.score-block{text-align:right}
	.score{font-weight:800;font-size:24px}
	.badge{padding:4px 10px;border-radius:8px;font-weight:700;font-size:12px;display:inline-block;margin-top:4px}
	.badge.green{background:#e7f6ec;color:#187246}
	.badge.blue{background:#e7f1fb;color:#1d4ed8}
	.badge.yellow{background:#fef3c7;color:#92400e}
	.badge.red{background:#fde2e1;color:#b42318}
	.badge.gray{background:#f3f4f6;color:#4b5563}
	.comment{margin:12px 0 4px;font-weight:600}
	.empty{background:#f8fafc;border-style:dashed;text-align:center}

	@media (max-width:900px){
		.filters{grid-template-columns:1fr}
	}
	@media (max-width:700px){
		.container{padding:0 12px}
		.page-header h1{font-size:22px}
	}
</style>
