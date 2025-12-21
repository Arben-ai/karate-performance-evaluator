<script>
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { buildAthleteOptions, findAthleteOption } from '$lib/utils/athleteView';
	import { activeAthlete } from '$lib/stores/activeAthlete';
	import { activeAthleteEmail } from '$lib/stores/activeAthleteEmail';

	export let data;

	const roles = [
		{ id: 'coach', title: 'Coach', subtitle: 'Bewerten und analysieren', href: '/coach/dashboard', type: 'shield', color: '#e11d2f' },
		{ id: 'athlet', title: 'Athlet', subtitle: 'Performance verfolgen', href: '/athlete/dashboard', type: 'trophy', color: '#0a0d14' },
	];

	let athletes = data?.athletes || [];
	let athleteOptions = [];
	let showModal = false;
	let activeRole = null;
	let email = '';
	let password = '';
	let selectedCoach = '';
	let selectedAthlete = '';
	let modalError = '';
	let modalEl;
	let openerEl = null;

	const coachOptions = ['Daniel', 'Andrea', 'Marc'];
	const coachEmailMap = {
		Daniel: 'daniel.coach@karate-swiss.ch',
		Andrea: 'andrea.coach@karate-swiss.ch',
		Marc: 'marc.coach@karate-swiss.ch'
	};

	$: athleteOptions = buildAthleteOptions(athletes || []);
	$: if (selectedAthlete && !email) {
		const match = findAthleteOption(athleteOptions, selectedAthlete);
		if (match) {
			email = match.email || buildFallbackEmail(match.label);
			if (email) activeAthleteEmail.set(email);
		}
	}

	async function openModal(role, event) {
		openerEl = event?.currentTarget || document.activeElement;
		activeRole = role;
		email = '';
		password = '';
		selectedCoach = '';
		selectedAthlete = '';
		modalError = '';
		showModal = true;
		await tick();
		let focusTarget = modalEl?.querySelector('#email');
		if (activeRole?.id === 'coach') {
			focusTarget = modalEl?.querySelector('#coach') ?? focusTarget;
		} else if (activeRole?.id === 'athlet') {
			focusTarget = modalEl?.querySelector('#athlete') ?? focusTarget;
		}
		if (focusTarget) focusTarget.focus();
		else modalEl?.focus();
	}

	async function closeModal() {
		showModal = false;
		activeRole = null;
		selectedCoach = '';
		selectedAthlete = '';
		modalError = '';
		await tick();
		try {
			if (openerEl) {
				openerEl.classList.add('focus-highlight');
				openerEl.focus();
				setTimeout(() => openerEl?.classList.remove('focus-highlight'), 700);
			}
		} catch (e) { /* noop */ }
		openerEl = null;
	}

	function handleKeyDown(e) {
		if (!modalEl) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			closeModal();
			return;
		}
		if (e.key === 'Tab') {
			const focusable = modalEl.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
			const nodes = Array.from(focusable).filter((n) => !n.hasAttribute('disabled'));
			if (nodes.length === 0) return;
			const idx = nodes.indexOf(document.activeElement);
			if (e.shiftKey) {
				if (idx === 0 || document.activeElement === modalEl) {
					e.preventDefault();
					nodes[nodes.length - 1].focus();
				}
			} else if (idx === nodes.length - 1) {
				e.preventDefault();
				nodes[0].focus();
			}
		}
	}

	function handleLogin() {
		modalError = '';
		if (activeRole?.id === 'coach' && !selectedCoach) {
			modalError = 'Bitte Coach auswählen';
			return;
		}
		if (activeRole?.id === 'athlet' && !selectedAthlete) {
			modalError = 'Bitte Athlet auswählen';
			return;
		}
		if (typeof document !== 'undefined' && selectedCoach) {
			const maxAge = 60 * 60 * 24 * 30; // 30 Tage
			document.cookie = `coachName=${encodeURIComponent(selectedCoach)}; path=/; max-age=${maxAge}`;
		}
		if (activeRole?.id === 'athlet' && selectedAthlete) {
			activeAthlete.set(selectedAthlete);
			if (email) activeAthleteEmail.set(email);
		}
		console.log('Login', { role: activeRole?.id, coach: selectedCoach, athlete: selectedAthlete, email, password });
		const target = activeRole?.href || '/';
		closeModal();
		goto(target);
	}

	function handleCoachSelect(value) {
		selectedCoach = value;
		const mail = coachEmailMap[value];
		if (mail) email = mail;
	}

	function handleAthleteSelect(value) {
		selectedAthlete = value;
		const option = findAthleteOption(athleteOptions, value);
		if (option) {
			email = option.email || buildFallbackEmail(option.label);
			activeAthleteEmail.set(email);
		}
	}

	function buildFallbackEmail(name = '') {
		const slug = (name || 'athlet')
			.toString()
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '.');
		const clean = slug.replace(/^\.+|\.+$/g, '') || 'athlet';
		return `${clean}@karate-swiss.ch`;
	}
	function Icon({ type }) {
		if (type === 'trophy') return trophy();
		if (type === 'shield') return shield();
		return user();
	}

	function trophy() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8 4h8v3.2a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4z"></path>
				<path d="M8 7H6a2.5 2.5 0 0 1-2.5-2.5V4H8"></path>
				<path d="M16 7h2a2.5 2.5 0 0 0 2.5-2.5V4H16"></path>
				<path d="M12 11v4.2"></path>
				<path d="M10.25 19.4h3.5"></path>
				<path d="M9 21h6"></path>
			</svg>
		`;
	}

	function shield() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 3.2 19 6v5c0 4.8-3.1 9.4-7 10.8C8.1 20.4 5 15.8 5 11V6z"></path>
			</svg>
		`;
	}

	function user() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="9" r="3.3"></circle>
				<path d="M6.5 19.5a5.5 5.5 0 0 1 11 0"></path>
				<path d="M6.5 19.5h11"></path>
			</svg>
		`;
	}
</script>

<main class="hero">
	<div class="center">
		<div class="logo">
			<div class="logo-square">
				<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M8 4h8v3.2a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4z"></path>
					<path d="M8 7H6a2.5 2.5 0 0 1-2.5-2.5V4H8"></path>
					<path d="M16 7h2a2.5 2.5 0 0 0 2.5-2.5V4H16"></path>
					<path d="M12 11v4.2"></path>
					<path d="M10.25 19.4h3.5"></path>
					<path d="M9 21h6"></path>
				</svg>
			</div>
			<h1>Karate Performance Evaluator</h1>
			<p class="subtitle">Schweizer Karate-Nationalkader</p>
		</div>

		<div class="cards">
			{#each roles as r}
				<button class="card" type="button" on:click={(e) => openModal(r, e)} aria-label={r.title}>
					<div class="icon" style={`background:${r.color}`}>
						{@html Icon({ type: r.type })}
					</div>
					<div class="card-text">
						<div class="card-title">{r.title}</div>
						<div class="card-sub">{r.subtitle}</div>
					</div>
				</button>
			{/each}
		</div>

		<p class="hint">W&auml;hlen Sie Ihre Rolle aus, um fortzufahren</p>
	</div>

	{#if showModal}
		<div class="overlay" on:click|self={closeModal} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); }}>
			<div bind:this={modalEl} class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" on:keydown={handleKeyDown}>
				<div class="modal-header">
					<div class="modal-icon">
						{@html Icon({ type: activeRole.type })}
					</div>
					<h3 id="modal-title">Anmeldung als {activeRole.title}</h3>
					<button class="close" aria-label="Schliessen" on:click={closeModal}>&times;</button>
				</div>
				<p class="modal-desc">Bitte geben Sie Ihre Anmeldedaten ein, um fortzufahren.</p>
				<form class="modal-form" on:submit|preventDefault={handleLogin}>
					{#if activeRole?.id === 'coach'}
						<label for="coach">Coach auswählen</label>
						<select id="coach" bind:value={selectedCoach} on:change={(e) => handleCoachSelect(e.target.value)} required>
							<option value="" disabled selected hidden>Coach wählen...</option>
							{#each coachOptions as c}
								<option value={c}>{c}</option>
							{/each}
						</select>
					{:else if activeRole?.id === 'athlet'}
						<label for="athlete">Athlet auswählen</label>
						<select
							id="athlete"
							bind:value={selectedAthlete}
							on:change={(e) => handleAthleteSelect(e.target.value)}
							required
							disabled={!athleteOptions.length}
						>
							<option value="" disabled selected hidden>Athlet wählen...</option>
							{#if !athleteOptions.length}
								<option value="" disabled>Keine Athleten verfügbar</option>
							{:else}
								{#each athleteOptions as opt (opt.id)}
									<option value={opt.id}>{opt.label}</option>
								{/each}
							{/if}
						</select>
					{/if}
					<label for="email">E-Mail</label>
					<input id="email" type="email" bind:value={email} required />
					<label for="password">Passwort</label>
					<input id="password" type="password" bind:value={password} required />
					{#if modalError}
						<div class="error">{modalError}</div>
					{/if}
					<div class="modal-actions">
						<button type="button" class="btn ghost" on:click={closeModal}>Abbrechen</button>
						<button type="submit" class="btn primary">Anmelden</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</main>

<style>
	.hero{
		min-height:100vh;
		display:flex;
		align-items:center;
		justify-content:center;
		background: linear-gradient(180deg, #1b2536 0%, #131c2b 45%, #0a1220 100%);
		color: #eef4fb;
		font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
	}

	.center{width:100%;max-width:1100px;padding:36px;text-align:center}

	.logo{margin-bottom:36px}
	.logo-square{display:inline-flex;align-items:center;justify-content:center;width:66px;height:66px;border-radius:12px;background:#e11d2f;margin:0 auto 12px}
	h1{margin:6px 0 4px;font-size:18px;font-weight:600}
	.subtitle{color:rgba(238,244,251,0.75);margin:0 0 28px;font-size:13px}

	.cards{display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:28px;margin:20px auto 28px;max-width:780px;justify-items:center}
	.card{width:100%;max-width:340px;display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px;border-radius:12px;text-decoration:none;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:inherit;transition:transform .14s ease, box-shadow .14s ease}
	.card:hover{transform:translateY(-6px);box-shadow:0 12px 34px rgba(10,18,32,0.45)}
	.card:active{transform:translateY(-2px);opacity:0.98}
	.card:focus{outline:none;box-shadow:0 8px 26px rgba(225,29,47,0.12)}

	:global(.focus-highlight){animation:focusPulse .7s ease forwards}
	@keyframes focusPulse{0%{box-shadow:0 0 0 0 rgba(225,29,47,0.0)}30%{box-shadow:0 10px 30px rgba(225,29,47,0.12)}100%{box-shadow:none}}

	.icon{width:76px;height:76px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(2,6,11,0.5)}
	.card-text{margin-top:6px}
	.card-title{font-weight:600}
	.card-sub{font-size:13px;color:rgba(238,244,251,0.7);margin-top:6px}

	.hint{color:rgba(238,244,251,0.6);margin-top:18px}

	@media (max-width:900px){
		.cards{grid-template-columns:1fr;max-width:420px;margin:0 auto}
	}

	.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,6,11,0.52);z-index:60}
	.modal{background:#fff;color:#111;border-radius:12px;max-width:560px;width:92%;padding:22px 22px 18px;box-shadow:0 30px 70px rgba(2,6,11,0.6)}
	.modal, .modal * { box-sizing: border-box; }
	.modal-header{display:flex;align-items:center;gap:12px}
	.modal-icon{width:42px;height:42px;border-radius:999px;background:#111;display:flex;align-items:center;justify-content:center;color:#fff}
	#modal-title{margin:0;font-size:16px}
	.close{margin-left:auto;background:transparent;border:0;color:#666;font-size:18px;cursor:pointer}
	.modal-desc{color:#6b7280;margin:14px 0}

	.modal-form label{display:block;text-align:left;font-size:13px;color:#374151;margin-top:10px;margin-bottom:6px}
	.modal-form input{width:100%;max-width:100%;padding:12px;border-radius:8px;border:1px solid #e6e9ee;background:#f8f8f9}
	.modal-form select{width:100%;max-width:100%;padding:12px;border-radius:8px;border:1px solid #e6e9ee;background:#f8f8f9}
	.error{color:#b91c1c;font-weight:600;font-size:13px;margin-top:6px}

	.modal-actions{display:flex;gap:14px;justify-content:flex-start;margin-top:18px}
	.btn{padding:10px 20px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);cursor:pointer}
	.btn.ghost{background:#fff}
	.btn.primary{background:#e11d2f;color:#fff;border:0}

</style>

