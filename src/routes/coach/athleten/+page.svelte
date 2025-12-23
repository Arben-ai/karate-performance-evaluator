<script>
	import { invalidateAll } from '$app/navigation';
	import NavBar from '$lib/NavBar.svelte';
import Card from '$lib/components/Card.svelte';
import FormField from '$lib/components/FormField.svelte';
import Badge from '$lib/components/Badge.svelte';
import CustomSelect from '$lib/components/CustomSelect.svelte';
import { evaluations } from '$lib/stores/evaluations';

export let data;
let list = data?.athletes || [];

let athleteForm = { athlete: '', discipline: '', coach: '', gender: '', age: '', rank: '' };
let sendingAthlete = false;
let athleteError = '';
let toast = '';
let toastTimer;
let searchTerm = '';
let filterDiscipline = 'alle';
let filterGender = 'alle';
let filterRank = 'alle';
let filterAge = 'alle';
let deleting = '';
let openMenuId = '';
let editingAthlete = null;
let editingAthleteId = '';
let editingAthleteName = '';
let editForm = { athlete: '', discipline: '', coach: '', gender: '', age: '', rank: '' };
let savingEdit = false;
let editError = '';

const genderOptions = [
	{ value: 'weiblich', label: 'Weiblich' },
	{ value: 'männlich', label: 'Männlich' }
];
const rankOptions = [
	{ value: '9. Kyu', label: '9. Kyu' },
	{ value: '8. Kyu', label: '8. Kyu' },
	{ value: '7. Kyu', label: '7. Kyu' },
	{ value: '6. Kyu', label: '6. Kyu' },
	{ value: '5. Kyu', label: '5. Kyu' },
	{ value: '4. Kyu', label: '4. Kyu' },
	{ value: '3. Kyu', label: '3. Kyu' },
	{ value: '2. Kyu', label: '2. Kyu' },
	{ value: '1. Kyu', label: '1. Kyu' },
	{ value: '1. Dan', label: '1. Dan' },
	{ value: '2. Dan', label: '2. Dan' },
	{ value: '3. Dan', label: '3. Dan' },
	{ value: '4. Dan', label: '4. Dan' },
	{ value: '5. Dan', label: '5. Dan' },
	{ value: '6. Dan', label: '6. Dan' },
	{ value: '7. Dan', label: '7. Dan' },
	{ value: '8. Dan', label: '8. Dan' },
	{ value: '9. Dan', label: '9. Dan' },
	{ value: '10. Dan', label: '10. Dan' }
];
const disciplineOptions = [
	{ value: 'Kata', label: 'Kata' },
	{ value: 'Kumite', label: 'Kumite' }
];
const coachOptions = [
	{ value: 'Daniel', label: 'Daniel' },
	{ value: 'Andrea', label: 'Andrea' },
	{ value: 'Marc', label: 'Marc' }
];
const filterAgeOptions = [
	{ value: 'alle', label: 'Alle Altersgruppen' },
	{ value: 'youth', label: 'Youth (unter 16)' },
	{ value: 'cadets', label: 'Cadets (16-18)' },
	{ value: 'juniors', label: 'Juniors (19-21)' },
	{ value: 'elite', label: 'Elite (über 21)' }
];

	const formatDate = (d) => {
		try {
			const date = new Date(d);
			if (Number.isNaN(date.getTime())) return d || '-';
			return date.toLocaleDateString('de-CH');
		} catch {
			return d || '-';
		}
	};

async function submitAthlete(payload, setError, setSending) {
	setError('');
	setSending(true);
	try {
		const res = await fetch('/api/athletes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(text || 'Fehler beim Speichern');
		}
		const saved = await res.json();
		const doc = {
			...payload,
			_id: saved?.insertedId ?? saved?._id,
			createdAt: saved?.createdAt ?? new Date().toISOString()
		};
		list = [doc, ...list];
		showToast(`Athlet ${doc.athlete || ''} hinzugefügt`.trim());
		invalidateAll().catch(() => {});
	} catch (e) {
		setError(e.message || 'Fehler beim Speichern');
	} finally {
		setSending(false);
	}
}

	async function createAthlete() {
		const ageNum = Number(athleteForm.age);
		if (
			!athleteForm.athlete ||
			!athleteForm.discipline ||
			!athleteForm.coach ||
			!athleteForm.gender ||
			!athleteForm.rank ||
			athleteForm.age === ''
		) {
			athleteError = 'Athlet, Disziplin, Hauptcoach, Geschlecht, Alter und Kyu/Dan sind Pflichtfelder.';
			return;
		}
		if (Number.isNaN(ageNum) || ageNum < 0) {
			athleteError = 'Bitte ein gültiges Alter (>= 0) angeben.';
			return;
		}
		await submitAthlete(
			{
				athlete: athleteForm.athlete,
				discipline: athleteForm.discipline,
				coach: athleteForm.coach,
				gender: athleteForm.gender,
				age: ageNum,
				rank: athleteForm.rank
			},
			(msg) => (athleteError = msg),
			(flag) => (sendingAthlete = flag)
		);
		if (!athleteError) {
			athleteForm = { athlete: '', discipline: '', coach: '', gender: '', age: '', rank: '' };
		}
	}

	function showToast(message) {
		toast = message;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast = '';
		}, 2500);
	}

  const normalize = (v) => (v || '').toString().toLowerCase().trim();
  const displayGender = (v) => {
    const raw = (v || '').toString();
    const l = raw.toLowerCase();
    if (l.includes('m')) return 'männlich';
    if (l.includes('w')) return 'weiblich';
    return raw || '';
  };
	const ts = (v) => {
		const t = Date.parse(v || '');
		return Number.isNaN(t) ? 0 : t;
	};

	$: sortedList = (list || [])
		.slice()
		.sort((a, b) => ts(b?.createdAt) - ts(a?.createdAt));

	$: filteredList = sortedList.filter((ath) => {
		const term = normalize(searchTerm);
		const name = normalize(ath?.athlete || ath?.name);
		const coach = normalize(ath?.coach);
		const discipline = normalize(ath?.discipline);
		const gender = normalize(ath?.gender);
		const rank = normalize(ath?.rank);
		const age = normalize(ath?.age);

		const matchesSearch = term
			? name.includes(term) ||
				coach.includes(term) ||
				discipline.includes(term) ||
				gender.includes(term) ||
				rank.includes(term) ||
				age.includes(term)
			: true;
		const matchesDiscipline = filterDiscipline === 'alle' ? true : discipline === normalize(filterDiscipline);
		const matchesGender = filterGender === 'alle' ? true : gender === normalize(filterGender);
		const matchesRank = filterRank === 'alle' ? true : rank === normalize(filterRank);
	const matchesAge =
			filterAge === 'alle'
				? true
				: (() => {
						const num = Number(ath?.age);
						if (Number.isNaN(num)) return false;
						if (filterAge === 'youth') return num < 16;
						if (filterAge === 'cadets') return num >= 16 && num <= 18;
						if (filterAge === 'juniors') return num >= 19 && num <= 21;
						if (filterAge === 'elite') return num > 21;
						return true;
				  })();

		return matchesSearch && matchesDiscipline && matchesGender && matchesRank && matchesAge;
	});

	function resetFilters() {
		searchTerm = '';
		filterDiscipline = 'alle';
		filterGender = 'alle';
		filterRank = 'alle';
		filterAge = 'alle';
	}

	const athleteId = (ath = {}) => {
		const raw = ath?._id ?? ath?.id;
		if (!raw) return '';
		if (typeof raw === 'string') return raw;
		if (typeof raw === 'object' && raw.$oid) return raw.$oid;
		return typeof raw.toString === 'function' ? raw.toString() : String(raw);
	};

	function buildEvaluateLink(ath = {}) {
		const params = new URLSearchParams();
		const id = athleteId(ath);
		if (id) params.set('athlete', id.toString());
		if (ath?.discipline) params.set('discipline', ath.discipline);
		const query = params.toString();
		return `/coach/bewertung${query ? `?${query}` : ''}`;
	}

	async function deleteAthlete(ath) {
		const id = athleteId(ath);
		if (!id) return;
		const target = list.find((item) => athleteId(item) === id);
		deleting = id;
		openMenuId = '';
		try {
			const res = await fetch(`/api/athletes?id=${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Löschen fehlgeschlagen');
			}
			list = list.filter((ath) => ath._id !== id);
			if (target?.athlete) await evaluations.removeByAthlete(target.athlete);
			showToast('Athlet gelöscht');
		} catch (e) {
			alert(e.message || 'Löschen fehlgeschlagen');
		} finally {
			deleting = '';
		}
	}

	function toggleMenu(ath) {
		const id = athleteId(ath);
		openMenuId = openMenuId === id ? '' : id;
	}

	function startEdit(ath) {
		if (!ath) return;
		editingAthlete = ath;
		editingAthleteId = athleteId(ath);
		editingAthleteName = (ath?.athlete || ath?.name || '').toString().trim();
		editForm = {
			athlete: ath?.athlete || ath?.name || '',
			discipline: ath?.discipline || '',
			coach: ath?.coach || '',
			gender: ath?.gender || '',
			age: ath?.age ?? '',
			rank: ath?.rank || ''
		};
		editError = '';
		openMenuId = '';
	}

	function cancelEdit() {
		editingAthlete = null;
		editingAthleteId = '';
		editingAthleteName = '';
		editError = '';
	}

	async function saveEdit() {
		if (!editingAthleteId) return;
		editError = '';
		const ageNum = Number(editForm.age);
		if (
			!editForm.athlete ||
			!editForm.discipline ||
			!editForm.coach ||
			!editForm.gender ||
			!editForm.rank ||
			editForm.age === '' ||
			Number.isNaN(ageNum) ||
			ageNum < 0
		) {
			editError = 'Bitte alle Felder ausfüllen und ein gültiges Alter angeben.';
			return;
		}
		savingEdit = true;
		try {
			const res = await fetch('/api/athletes', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: editingAthleteId,
					previousAthlete: editingAthleteName,
					athlete: editForm.athlete,
					discipline: editForm.discipline,
					coach: editForm.coach,
					gender: editForm.gender,
					age: ageNum,
					rank: editForm.rank
				})
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Speichern fehlgeschlagen');
			}
			const updated = await res.json();
			list = list.map((a) => (athleteId(a) === editingAthleteId ? { ...a, ...updated } : a));
			editingAthlete = null;
			editingAthleteId = '';
			editingAthleteName = '';
			showToast('Athlet aktualisiert');
			invalidateAll().catch(() => {});
			evaluations.loadFromApi?.();
		} catch (e) {
			editError = e.message || 'Speichern fehlgeschlagen';
		} finally {
			savingEdit = false;
		}
	}
</script>

<div class="app-shell">
	<NavBar active="athleten" />
	{#if toast}
		<div class="toast">{toast}</div>
	{/if}

	<main class="page container">
		<header class="page-header">
			<div>
				<h1>Athleten</h1>
				<p class="muted">Verwalten Sie Athleten und behalten Sie deren Stammdaten im Blick</p>
			</div>
		</header>

		<div class="form-card-grid">
			<div class="form-card fly-in">
				<Card title="Athlet erfassen" subtitle="Neuen Athleten hinzufügen">
					<div class="form-grid compact">
						<FormField label="Athlet *" placeholder="Name" bind:value={athleteForm.athlete} required />
						<FormField label="Alter *" type="number" min="0" step="1" placeholder="z.B. 22" bind:value={athleteForm.age} required />					<div class="select-wrap">
						<label class="label-with-info">
							Hauptcoach *
							<span class="label-info" aria-label="Hinweis">
								i
								<span class="label-tip">
									Primäre Coach-Zuordnung für den Athleten. Andere Coaches können trotzdem Bewertungen erfassen.
								</span>
							</span>
						</label>
						<CustomSelect
							placeholder="Hauptcoach wählen..."
							options={coachOptions}
							bind:value={athleteForm.coach}
						/>
					</div>

						<div class="select-wrap">
							<label>Geschlecht *</label>
							<CustomSelect
								placeholder="Geschlecht wählen..."
								options={genderOptions}
								bind:value={athleteForm.gender}
							/>
						</div>
						<div class="select-wrap">
							<label>Kyu/Dan *</label>
							<CustomSelect
								placeholder="Grad wählen..."
								options={rankOptions}
								bind:value={athleteForm.rank}
							/>
						</div>
						<div class="select-wrap">
							<label>Disziplin *</label>
							<CustomSelect
								placeholder="Disziplin wählen..."
								options={disciplineOptions}
								bind:value={athleteForm.discipline}
							/>
						</div>
					</div>
				{#if athleteError}
						<div class="error">{athleteError}</div>
					{/if}
					<div class="form-actions">
						<button class="btn primary" type="button" on:click={createAthlete} disabled={sendingAthlete}>
							{sendingAthlete ? 'Speichern...' : 'Athlet speichern'}
						</button>
					</div>
				</Card>
			</div>

			
		</div>

		{#if list.length === 0}
			<div class="empty card">
				<h3>Noch keine Athleten</h3>
				<p>Lege den ersten Athleten an, um ihn hier zu sehen.</p>
			</div>
		{:else}
			<div class="list-header">
				<div>
					<h3>Athletenübersicht</h3>
					<p class="muted small">Suche und filtere Athleten nach Disziplin und Geschlecht</p>
				</div>
				<div class="filters">
					<input
						type="search"
						placeholder="Athlet oder Hauptcoach suchen..."
						bind:value={searchTerm}
						class="filter-input"
					/>
					<CustomSelect
						placeholder="Alle Disziplinen"
						options={[{ value: 'alle', label: 'Alle Disziplinen' }, ...disciplineOptions]}
						bind:value={filterDiscipline}
					/>
					<CustomSelect
						placeholder="Alle Geschlechter"
						options={[{ value: 'alle', label: 'Alle Geschlechter' }, ...genderOptions]}
						bind:value={filterGender}
					/>
					<CustomSelect
						placeholder="Alle Grade"
						options={[{ value: 'alle', label: 'Alle Grade' }, ...rankOptions]}
						bind:value={filterRank}
					/>
					<CustomSelect
						placeholder="Alle Altersgruppen"
						options={filterAgeOptions}
						bind:value={filterAge}
					/>
					<button class="btn ghost small" type="button" on:click={resetFilters}>Filter zurücksetzen</button>
				</div>
				<div class="count-pill">{filteredList.length} {filteredList.length === 1 ? 'Athlet' : 'Athleten'}</div>
			</div>
			<section class="grid">
				{#if filteredList.length === 0}
					<div class="empty card">
						<h3>Keine Treffer</h3>
						<p>Passe Suche oder Filter an, um Athleten zu sehen.</p>
					</div>
				{:else}
					{#each filteredList as ath, index (ath._id || ath.id || ath.athlete || ath.name)}
						<div class="grid-item reveal-card" style={`--delay:${index}`}>
							<Card>
							<div class="top">
								<div>
									<Badge tone="blue" label={ath.discipline || '-'} />
									<h3 class="athlete-name">{ath.athlete || ath.name || 'Unbekannt'}</h3>
									{#if ath.coach}<p class="muted">Hauptcoach: {ath.coach}</p>{/if}
									{#if ath.gender || ath.age || ath.rank}
										<ul class="meta-list">
											{#if ath.gender}
												<li class="meta-row">
													<span class="meta-pair">
														<span class="meta-label">Geschlecht:</span>
														<span class="meta-value">{displayGender(ath.gender)}</span>
													</span>
												</li>
											{/if}
											{#if ath.age}
												<li class="meta-row">
													<span class="meta-pair">
														<span class="meta-label">Alter:</span>
														<span class="meta-value">{ath.age}</span>
													</span>
												</li>
											{/if}
											{#if ath.rank}
												<li class="meta-row">
													<span class="meta-pair">
														<span class="meta-label">Grad:</span>
														<span class="meta-value">{ath.rank}</span>
													</span>
												</li>
											{/if}
										</ul>
									{/if}
								</div>
								<div class="top-right">
									<div class="score small-score">{formatDate(ath.createdAt)}</div>
									<div class="menu-wrap">
										<button class="icon-btn" type="button" on:click={() => toggleMenu(ath)} title="Aktionen">
											{openMenuId === athleteId(ath) ? 'x' : '...'}
										</button>
										{#if openMenuId === athleteId(ath)}
											<div class="card-menu">
												<button type="button" class="menu-item" on:click={() => startEdit(ath)}>
													Athlet bearbeiten
												</button>
												<button
													type="button"
													class="menu-item danger"
													on:click={() => deleteAthlete(ath)}
													disabled={deleting === athleteId(ath)}
												>
													{deleting === athleteId(ath) ? 'Lösche...' : 'Athlet löschen'}
												</button>
											</div>
										{/if}
									</div>
								</div>
							</div>
							<div class="card-actions">
								<a class="btn ghost" href={buildEvaluateLink(ath)}>Bewerten</a>
							</div>
							</Card>
						</div>
					{/each}
				{/if}
			</section>
		{/if}
		{#if editingAthlete}
			<div class="modal-backdrop" on:click={cancelEdit}>
				<div class="modal card" on:click|stopPropagation>
					<div class="modal-header">
						<h3>Athlet bearbeiten</h3>
						<button class="icon-btn" type="button" on:click={cancelEdit} aria-label="Schliessen">
							x
						</button>
					</div>
					<div class="form-grid compact">
						<FormField label="Athlet *" placeholder="Name" bind:value={editForm.athlete} required />
						<FormField
							label="Alter *"
							type="number"
							min="0"
							step="1"
							placeholder="z.B. 22"
							bind:value={editForm.age}
							required
						/>
						<div class="select-wrap">
							<label>Hauptcoach *</label>
							<CustomSelect
								placeholder="Hauptcoach waehlen..."
								options={coachOptions}
								bind:value={editForm.coach}
							/>
						</div>
						<div class="select-wrap">
							<label>Geschlecht *</label>
							<CustomSelect
								placeholder="Geschlecht waehlen..."
								options={genderOptions}
								bind:value={editForm.gender}
							/>
						</div>
						<div class="select-wrap">
							<label>Kyu/Dan *</label>
							<CustomSelect
								placeholder="Grad waehlen..."
								options={rankOptions}
								bind:value={editForm.rank}
							/>
						</div>
						<div class="select-wrap">
							<label>Disziplin *</label>
							<CustomSelect
								placeholder="Disziplin waehlen..."
								options={disciplineOptions}
								bind:value={editForm.discipline}
							/>
						</div>
					</div>
					{#if editError}
						<div class="error">{editError}</div>
					{/if}
					<div class="modal-actions">
						<button class="btn ghost" type="button" on:click={cancelEdit} disabled={savingEdit}>
							Abbrechen
						</button>
						<button class="btn primary" type="button" on:click={saveEdit} disabled={savingEdit}>
							{savingEdit ? 'Speichern...' : 'Aenderungen speichern'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body){
		background:#f7f8fb;
		font-family:
			Inter,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial,
			sans-serif;
		margin:0;
	}
	.page.container{max-width:1200px;margin:24px auto;padding:0 20px;display:flex;flex-direction:column;gap:16px}
	.page-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
	h1{margin:0;font-size:26px;font-weight:700}
	.muted{margin:4px 0 0;color:#6b7280;font-size:14px}
	.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-weight:600;text-decoration:none;border:1px solid transparent;cursor:pointer}
	.btn.primary{background:#e11d2f;color:#fff;border-color:#e11d2f}
	.btn.primary:hover{box-shadow:0 8px 18px rgba(225,29,47,0.25)}
	.btn.ghost{background:#fff;border:1px solid #e5e7eb;color:#111}
	.btn.small{padding:8px 12px;font-size:13px}

	.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
	.full{grid-column:1 / -1}
	.error{color:#b91c1c;font-weight:600;font-size:13px}

	.card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 8px 18px rgba(15,23,36,0.05);padding:16px}
	.form-card-grid{display:grid;grid-template-columns:1fr;gap:56px;margin:18px 0 32px}
	.form-card-grid + .grid{margin-top:32px}
	.form-card-grid + .empty{margin-top:12px}
	.form-card + .form-card{margin-top:4px}
	.form-card :global(.card){padding:18px 18px 12px;border-radius:14px;box-shadow:0 10px 22px rgba(15,23,36,0.06);height:100%}
	.form-card :global(.card-header){margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #eef2f6}
	.form-card :global(.card-header h3){font-size:20px}
	.form-card :global(.card-header p){margin-top:6px;color:#6b7280;font-size:14px}
	.form-card.fly-in{
		opacity:0;
		transform:translateX(-22px);
		animation:formFlyIn 560ms ease forwards;
		animation-delay:120ms;
	}
	.form-card .form-grid{
		display:grid;
		grid-template-columns:repeat(3,minmax(0,1fr));
		gap:14px;
	}
	.form-card .compact{row-gap:14px}
	.form-card .full{grid-column:1 / -1}
	.form-card .form-actions{display:flex;justify-content:flex-end;margin-top:6px}
	.form-card .form-actions .btn.primary{min-width:auto;border-radius:10px;justify-content:center;text-align:center;padding:12px 16px}
	.select-wrap{display:flex;flex-direction:column;gap:6px}
	.select-wrap select{width:100%;padding:12px 14px;border-radius:10px;border:1px solid #e5e7eb;font-size:15px}
	.select-wrap :global(.combo .trigger){background:#fff}
	.select-wrap label{font-weight:600;font-size:15px;color:#1f2937}
	.label-with-info{display:flex;align-items:center;gap:6px}
	.label-info{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#eef1f5;color:#0f1724;font-weight:700;font-size:11px;position:relative;cursor:default;border:1px solid #dfe3e8}
	.label-info .label-tip{display:none;position:absolute;top:26px;left:50%;transform:translateX(-50%);background:#0f1724;color:#fff;padding:8px 10px;border-radius:10px;box-shadow:0 10px 20px rgba(0,0,0,0.15);font-size:12px;font-weight:600;line-height:1.35;min-width:220px;z-index:10}
	.label-info:hover .label-tip{display:block}
	.list-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:6px 0 10px}
	.list-header h3{margin:0}
	.list-header .small{font-size:13px;margin-top:4px}
	.filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
	.filter-input{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;font-size:15px;min-width:220px}
	.filters select{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;font-size:15px;min-width:160px}
	.filters :global(.combo){min-width:160px}
	.filters :global(.combo .trigger){background:#fff}
	.count-pill{background:#eef1f5;padding:6px 12px;border-radius:999px;color:#111;font-weight:600;font-size:13px;border:1px solid #e2e6ec}
	.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
	.grid-item{display:block}
	.reveal-card{
		opacity:0;
		transform:translateY(18px);
		animation:cardReveal 520ms ease forwards;
		animation-delay:calc(var(--delay, 0) * 70ms);
	}
	.top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
	.top > div:first-child{flex:1;min-width:0}
	.top-right{flex-shrink:0;align-items:flex-start}
	.athlete-name{
		margin:8px 0 6px;
		display:-webkit-box;
		-webkit-box-orient:vertical;
		-webkit-line-clamp:2;
		overflow:hidden;
		line-height:1.2;
		min-height:2.4em;
	}
	.muted{margin:0 0 6px}
	.meta-list{margin:6px 0 0;padding-left:18px;font-size:13px;color:#4b5563}
	.pill{display:inline-block;background:#eef1f5;padding:4px 10px;border-radius:999px;font-size:12px;color:#111;border:1px solid #e2e6ec;margin-bottom:6px}
	.score{font-size:28px;font-weight:800;color:#0f1724}
	.card-actions{margin-top:10px;display:flex;justify-content:flex-end}
	.small-score{font-size:14px;font-weight:600}
	.meta-list{margin:6px 0 0;padding-left:18px;font-size:13px;color:#4b5563}
	.meta-row{list-style-position:outside;margin-bottom:4px}
	.meta-pair{display:inline-flex;gap:4px;white-space:nowrap}
	.meta-label{font-weight:600;color:#4b5563}
	.meta-value{color:#4b5563}
	.top-right{display:flex;align-items:flex-start;gap:8px}
	.icon-btn{
		border:1px solid #e5e7eb;
		background:#fff;
		border-radius:8px;
		padding:4px 8px;
		cursor:pointer;
		font-size:18px;
		line-height:1;
	}
	.icon-btn:disabled{opacity:0.6;cursor:default}
	.menu-wrap{position:relative;display:inline-block}
	.card-menu{
		position:absolute;
		top:30px;
		right:0;
		background:#fff;
		border:1px solid #e5e7eb;
		border-radius:10px;
		box-shadow:0 10px 24px rgba(0,0,0,0.12);
		padding:6px;
		min-width:150px;
		z-index:5;
	}
	.menu-item{
		width:100%;
		border:0;
		background:#fff;
		border-radius:8px;
		padding:8px 10px;
		text-align:left;
		font-weight:700;
		cursor:pointer;
	}
	.menu-item.danger{color:#b91c1c}
	.menu-item:disabled{opacity:0.7;cursor:default}
	.modal-backdrop{
		position:fixed;
		inset:0;
		background:rgba(15,23,36,0.55);
		display:flex;
		align-items:center;
		justify-content:center;
		padding:20px;
		z-index:30;
	}
	.modal{
		width:min(720px, 96vw);
		border-radius:14px;
	}
	.modal-header{
		display:flex;
		align-items:center;
		justify-content:space-between;
		gap:12px;
		margin-bottom:12px;
	}
	.modal-actions{
		display:flex;
		justify-content:flex-end;
		gap:10px;
		margin-top:12px;
	}
	.toast{
		position:fixed;
		top:18px;
		right:18px;
		background:#0f1724;
		color:#fff;
		padding:10px 14px;
		border-radius:10px;
		box-shadow:0 8px 16px rgba(0,0,0,0.18);
		font-weight:700;
		font-size:14px;
		z-index:20;
	}
	.meta{display:flex;gap:10px;font-size:13px;color:#6b7280;margin:6px 0 10px}
	.comment{margin:0 0 10px;color:#1f2937;font-size:14px;line-height:1.45}
	.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
	.detail{background:#f8fafc;border:1px solid #eef2f6;border-radius:8px;padding:8px}
	.detail .label{color:#6b7280;font-size:12px}
	.detail .value{font-weight:700}
	.empty{text-align:center;padding:28px}

	@keyframes cardReveal{
		from{opacity:0;transform:translateY(18px)}
		to{opacity:1;transform:translateY(0)}
	}

	@keyframes formFlyIn{
		from{opacity:0;transform:translateX(-22px)}
		to{opacity:1;transform:translateX(0)}
	}

	@media (prefers-reduced-motion: reduce){
		.reveal-card,
		.form-card.fly-in{animation:none;opacity:1;transform:none}
	}

	@media (max-width: 720px){
		.page-header{align-items:flex-start}
		.btn.primary{width:100%;justify-content:center}
		.details{grid-template-columns:1fr}
	}

	@media (max-width: 1000px){
		.form-card .form-grid{
			grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
		}
	}
</style>





























