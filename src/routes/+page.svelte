
<script>
	const roles = [
		{ id: 'coach', title: 'Coach', subtitle: 'Bewerten und analysieren', href: '/coach', type: 'shield', color: '#e11d2f' },
		{ id: 'athlet', title: 'Athlet', subtitle: 'Performance verfolgen', href: '/athlete', type: 'trophy', color: '#0f1724' },
		{ id: 'referee', title: 'Schiedsrichter', subtitle: 'Wettkämpfe bewerten', href: '/referee', type: 'user', color: '#4b5563' }
	];

	import { tick } from 'svelte';

	let showModal = false;
	let activeRole = null;
	let email = '';
	let password = '';
	let modalEl;
	let openerEl = null;

	async function openModal(role, event) {
		openerEl = event?.currentTarget || document.activeElement;
		activeRole = role;
		email = '';
		password = '';
		showModal = true;
		await tick();
		// focus first focusable element inside modal (email input)
		if (modalEl) {
			const input = modalEl.querySelector('#email');
			if (input) input.focus();
			else modalEl.focus();
		}
	}

	async function closeModal() {
		showModal = false;
		activeRole = null;
		await tick();
		// restore focus to the opener element if available
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
			} else {
				if (idx === nodes.length - 1) {
					e.preventDefault();
					nodes[0].focus();
				}
			}
		}
	}

	import { goto } from '$app/navigation';

	function handleLogin() {
		// For now: accept any credentials and navigate to the selected role page
		console.log('Login', { role: activeRole?.id, email, password });
		const target = activeRole?.href || '/';
		// close the modal and navigate
		closeModal();
		goto(target);
	}

	function Icon({ type }) {
		if (type === 'trophy') return trophy();
		if (type === 'shield') return shield();
		return user();
	}

	function trophy() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v2a3 3 0 0 1-3 3H11A3 3 0 0 1 8 5V3z"></path><path d="M6 8v2a6 6 0 0 0 6 6 6 6 0 0 0 6-6V8"></path><path d="M9 21h6"></path></svg>
		`;
	}

	function shield() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l7 4v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V6l7-4z"></path></svg>
		`;
	}

	function user() {
		return `
			<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
		`;
	}
</script>

<main class="hero">
	<div class="center">
		<div class="logo">
			<div class="logo-square">
				<!-- small trophy icon in white -->
				<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8v2a3 3 0 0 1-3 3H11A3 3 0 0 1 8 5V3z"></path><path d="M6 8v2a6 6 0 0 0 6 6 6 6 0 0 0 6-6V8"></path><path d="M9 21h6"></path></svg>
			</div>
			<h1>Karate Performance Evaluator</h1>
			<p class="subtitle">Schweizer Karate-Nationalkader</p>
		</div>

		<div class="cards">
			{#each roles as r}
				<button class="card" type="button" on:click={(e) => openModal(r, e)} aria-label={r.title}>
					<div class="icon" style="background:{r.color}">
						{@html Icon({ type: r.type })}
					</div>
					<div class="card-text">
						<div class="card-title">{r.title}</div>
						<div class="card-sub">{r.subtitle}</div>
					</div>
				</button>
			{/each}
		</div>

		<p class="hint">Wählen Sie Ihre Rolle aus, um fortzufahren</p>
	</div>

	{#if showModal}
		<div class="overlay" on:click|self={closeModal} role="button" tabindex="0" on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); }}>
			<div bind:this={modalEl} class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" on:keydown={handleKeyDown}>
				<div class="modal-header">
					<div class="modal-icon">
						{@html Icon({ type: activeRole.type })}
					</div>
					<h3 id="modal-title">Anmeldung als {activeRole.title}</h3>
					<button class="close" aria-label="Schliessen" on:click={closeModal}>✕</button>
				</div>
				<p class="modal-desc">Bitte geben Sie Ihre Anmeldedaten ein, um fortzufahren.</p>
				<form class="modal-form" on:submit|preventDefault={handleLogin}>
					<label for="email">E-Mail</label>
					<input id="email" type="email" bind:value={email} required />
					<label for="password">Passwort</label>
					<input id="password" type="password" bind:value={password} required />
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
		background: linear-gradient(180deg, #0f1724 0%, #0b1220 45%, #02060b 100%);
		color: #e6eef6;
		font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
	}

	.center{width:100%;max-width:1100px;padding:36px;text-align:center}

	.logo{margin-bottom:36px}
	.logo-square{display:inline-flex;align-items:center;justify-content:center;width:66px;height:66px;border-radius:12px;background:#e11d2f;margin:0 auto 12px}
	h1{margin:6px 0 4px;font-size:18px;font-weight:600}
	.subtitle{color:rgba(230,238,246,0.6);margin:0 0 28px;font-size:13px}

	.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin:20px 0 28px}
	.card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px;border-radius:12px;text-decoration:none;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);color:inherit;transition:transform .14s ease, box-shadow .14s ease}
	.card:hover{transform:translateY(-6px);box-shadow:0 10px 30px rgba(2,6,11,0.6)}
	.card:active{transform:translateY(-2px);opacity:0.98}
	.card:focus{outline:none;box-shadow:0 8px 26px rgba(225,29,47,0.12)}

	/* focus highlight when restoring focus */
	:global(.focus-highlight){animation:focusPulse .7s ease forwards}
	@keyframes focusPulse{0%{box-shadow:0 0 0 0 rgba(225,29,47,0.0)}30%{box-shadow:0 10px 30px rgba(225,29,47,0.12)}100%{box-shadow:none}}

	.icon{width:76px;height:76px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(2,6,11,0.5)}
	.card-text{margin-top:6px}
	.card-title{font-weight:600}
	.card-sub{font-size:13px;color:rgba(230,238,246,0.55);margin-top:6px}

	.hint{color:rgba(230,238,246,0.45);margin-top:18px}

	@media (max-width:900px){
		.cards{grid-template-columns:1fr;max-width:420px;margin:0 auto}
	}

	/* Modal styles */

	.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,6,11,0.52);z-index:60}
	.modal{background:#fff;color:#111;border-radius:12px;max-width:560px;width:92%;padding:22px 22px 18px;box-shadow:0 30px 70px rgba(2,6,11,0.6)}
	/* ensure inputs and children don't overflow modal */
	.modal, .modal * { box-sizing: border-box; }
	.modal-header{display:flex;align-items:center;gap:12px}
	.modal-icon{width:42px;height:42px;border-radius:999px;background:#111;display:flex;align-items:center;justify-content:center;color:#fff}
	#modal-title{margin:0;font-size:16px}
	.close{margin-left:auto;background:transparent;border:0;color:#666;font-size:18px;cursor:pointer}
	.modal-desc{color:#6b7280;margin:14px 0}

	.modal-form label{display:block;text-align:left;font-size:13px;color:#374151;margin-top:10px;margin-bottom:6px}
	.modal-form input{width:100%;max-width:100%;padding:12px;border-radius:8px;border:1px solid #e6e9ee;background:#f8f8f9}

	.modal-actions{display:flex;gap:14px;justify-content:flex-start;margin-top:18px}
	.btn{padding:10px 20px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);cursor:pointer}
	.btn.ghost{background:#fff}
	.btn.primary{background:#e11d2f;color:#fff;border:0}

</style>
