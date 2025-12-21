<script>
	import { onDestroy, onMount } from 'svelte';
	import NavBar from '$lib/NavBar.svelte';
	import { goto } from '$app/navigation';
	import { evaluations as evaluationStore, normalizeEval } from '$lib/stores/evaluations';
	import { activeAthlete } from '$lib/stores/activeAthlete';
	import { activeAthleteEmail } from '$lib/stores/activeAthleteEmail';
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
	let storedEmail = '';
	let bestScore = '-';
	let sessionCount = 0;
	let firstDate = null;
	let evalUnsub;
	let activeUnsub;
	let emailUnsub;
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
		emailUnsub = activeAthleteEmail.subscribe((val) => {
			storedEmail = val || '';
		});
	});

	onDestroy(() => {
		evalUnsub?.();
		activeUnsub?.();
		emailUnsub?.();
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
	$: if (activeOption?.email) {
		activeAthleteEmail.set(activeOption.email);
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
	$: lastEval = myEvals[0] || null;
	$: firstDate = (() => {
		if (!myEvals.length) return null;
		const sorted = myEvals.slice().sort((a, b) => ts(a?.createdAt || a?.date) - ts(b?.createdAt || b?.date));
		return sorted[0]?.date || sorted[0]?.createdAt || null;
	})();
	$: badgeCounts = myEvals.reduce((acc, ev) => {
		const badge = badgeForScore(ev.score, ev.badge, ev.badgeTone).label;
		acc[badge] = (acc[badge] || 0) + 1;
		return acc;
	}, {});
	$: disciplineStats = (() => {
		const map = new Map();
		for (const ev of myEvals) {
			const key = normalizeKey(ev?.discipline) || 'allgemein';
			const score = Number(ev?.score);
			const entry = map.get(key) || { name: ev?.discipline || 'Allgemein', scores: [] };
			if (Number.isFinite(score)) entry.scores.push(score);
			map.set(key, entry);
		}
		return Array.from(map.values()).map((v) => ({
			...v,
			avg: v.scores.length ? Math.round(v.scores.reduce((a,b)=>a+b,0)/v.scores.length) : '-',
			best: v.scores.length ? Math.max(...v.scores) : '-'
		}));
	})();
	$: strengths = disciplineStats.slice().sort((a,b) => (Number.isFinite(b.avg)?b.avg:0) - (Number.isFinite(a.avg)?a.avg:0)).slice(0,2);
	$: goals = (() => {
		const list = [];
		if (!myEvals.length) {
			return [
				'Erste Bewertungen sammeln, um ein Profil aufzubauen.',
				'Coach und Disziplinen im Profil ergänzen.'
			];
		}
		if (typeof avgScore === 'number' && avgScore < 85) {
			list.push('Durchschnitt um 5 Punkte in den nächsten 30 Tagen steigern.');
		}
		const weakest = disciplineStats.slice().sort((a,b) => (Number.isFinite(a.avg)?a.avg:0) - (Number.isFinite(b.avg)?b.avg:0))[0];
		if (weakest?.name) {
			list.push(`Fokus auf ${weakest.name}: gezieltes Techniktraining einplanen.`);
		}
		if (lastEval?.comment) {
			list.push('Feedback aus der letzten Einheit in den Trainingsplan aufnehmen.');
		}
		return list.slice(0,3);
	})();

	$: displayName = activeOption?.label || 'Athlet';
	$: email = activeOption?.email || storedEmail || '';
	$: coachName = activeOption?.coach || 'Noch offen';
	$: discipline = activeOption?.discipline || 'Disziplin';
	$: rank = activeOption?.rank || '-';
	$: age = activeOption?.age ?? '-';
	$: gender = activeOption?.gender || '-';
</script>

<div class="app-shell">
	<NavBar role="athlete" active="profil" />

<main class="page container">
		<header class="page-header">
			<div>
				<h1>Mein Profil</h1>
				<p class="muted">Persönliche Daten</p>
			</div>
		</header>

		<section class="grid-two">
			<div class="card profile-card">
				<div class="avatar-wrap">
					<div class="avatar">
						<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="9" r="3.3"></circle>
							<path d="M6.5 19.5a5.5 5.5 0 0 1 11 0"></path>
							<path d="M6.5 19.5h11"></path>
						</svg>
					</div>
				</div>
				<div class="profile-name">{displayName}</div>
				<div class="badge">Athlet</div>
				<button class="logout" type="button" on:click={() => goto('/')}>{'<-'} Abmelden</button>
			</div>

			<div class="card contact-card">
				<h3>Kontaktinformationen</h3>
				<div class="info-grid">
					<div class="info-row">
						<div class="icon">✉</div>
						<div>
							<div class="label">E-Mail</div>
							<div class="value">{email || 'Nicht hinterlegt'}</div>
						</div>
					</div>
					<div class="info-row">
						<div class="icon">🏅</div>
						<div>
							<div class="label">Coach</div>
							<div class="value">{coachName}</div>
						</div>
					</div>
					<div class="info-row">
						<div class="icon">📍</div>
						<div>
							<div class="label">Disziplin</div>
							<div class="value">{discipline}</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="card section">
			<h3>Profilinformationen</h3>
			<div class="info-grid two-cols">
				<div class="info-row">
					<div class="icon">🎯</div>
					<div>
						<div class="label">Kyu / Dan</div>
						<div class="value">{rank}</div>
					</div>
				</div>
				<div class="info-row">
					<div class="icon">🎂</div>
					<div>
						<div class="label">Alter</div>
						<div class="value">{age}</div>
					</div>
				</div>
				<div class="info-row">
					<div class="icon">⚧</div>
					<div>
						<div class="label">Geschlecht</div>
						<div class="value">{gender}</div>
					</div>
				</div>
				<div class="info-row">
					<div class="icon">📅</div>
					<div>
						<div class="label">Mitglied seit</div>
						<div class="value">{firstDate ? formatDate(firstDate) : 'Noch keine Daten'}</div>
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
	.logout{padding:10px 14px;border-radius:10px;border:1px solid #e11d2f;color:#e11d2f;background:#fff;font-weight:700;cursor:pointer;margin-top:6px}
	.logout:hover{background:#fdf2f3}

	.grid-two{display:grid;grid-template-columns:1.1fr 2fr;gap:16px;margin:18px 0}
	.card{background:#fff;border:1px solid #e8ebf0;border-radius:12px;padding:18px;box-shadow:0 8px 18px rgba(15,23,36,0.04)}
	.profile-card{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
	.avatar-wrap{width:90px;height:90px;border-radius:999px;background:linear-gradient(145deg,#e11d2f,#f87171);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 28px rgba(225,29,47,0.25)}
	.avatar{width:70px;height:70px;border-radius:999px;background:#111;display:flex;align-items:center;justify-content:center}
	.profile-name{font-weight:800;font-size:20px;margin-top:8px}
	.badge{padding:6px 10px;border-radius:999px;background:#fdf2f3;color:#b91c1c;font-weight:700;font-size:12px}
	.profile-role{color:#6b7280}

	.contact-card h3{margin:0 0 12px;font-size:17px}
	.info-grid{display:grid;grid-template-columns:1fr;gap:10px}
	.info-grid.two-cols{grid-template-columns:repeat(2,1fr)}
	.info-row{display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:10px;border:1px solid #eef1f5;background:#f8fafc}
	.icon{width:28px;height:28px;border-radius:8px;background:#0f1724;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
	.label{color:#6b7280;font-size:12px;margin-bottom:4px}
	.value{font-weight:700}

	.section{margin-top:14px}
	.section h3{margin:0 0 12px;font-size:17px}

	@media (max-width:1000px){
		.grid-two{grid-template-columns:1fr}
		.info-grid.two-cols{grid-template-columns:1fr}
	}
	@media (max-width:700px){
		.container{padding:0 12px}
		.page-header h1{font-size:22px}
		.stat-grid{grid-template-columns:repeat(2,1fr)}
	}
</style>
