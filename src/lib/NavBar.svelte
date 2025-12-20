<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let active = '';
	export let role = 'coach';

	const navItemsByRole = {
		coach: [
			{ id: 'dashboard', label: 'Dashboard', href: '/coach/dashboard', icon: 'home' },
			{ id: 'athleten', label: 'Athleten', href: '/coach/athleten', icon: 'chart' },
			{ id: 'bewertung', label: 'Bewertung', href: '/coach/bewertung', icon: 'clipboard' },
			{ id: 'feedback', label: 'Feedback', href: '/coach/feedback', icon: 'chat' },
			{ id: 'analyse', label: 'Analyse', href: '/coach/analyse', icon: 'chart' },
			{ id: 'profil', label: 'Profil', href: '/coach/profil', icon: 'user' }
		],
		athlete: [
			{ id: 'dashboard', label: 'Dashboard', href: '/athlete/dashboard', icon: 'home' },
			{ id: 'analyse', label: 'Analyse', href: '/athlete/analyse', icon: 'chart' },
			{ id: 'feedback', label: 'Feedback', href: '/athlete/feedback', icon: 'chat' },
			{ id: 'profil', label: 'Profil', href: '/athlete/profil', icon: 'user' }
		],
		referee: [
			{ id: 'dashboard', label: 'Dashboard', href: '/referee/dashboard', icon: 'home' },
			{ id: 'bewertung', label: 'Bewertung', href: '/referee/bewertung', icon: 'clipboard' },
			{ id: 'analyse', label: 'Analyse', href: '/referee/analyse', icon: 'chart' },
			{ id: 'feedback', label: 'Feedback', href: '/referee/feedback', icon: 'chat' },
			{ id: 'profil', label: 'Profil', href: '/referee/profil', icon: 'user' }
		]
	};

	function icon(type) {
		if (type === 'home') return home();
		if (type === 'clipboard') return clipboard();
		if (type === 'chart') return chart();
		if (type === 'chat') return chat();
		return user();
	}

	function home() {
		return `
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 11.5 12 4l8 7.5"></path>
				<path d="M7.5 10v9h9v-9"></path>
			</svg>
		`;
	}

	function clipboard() {
		return `
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<rect x="5" y="4.5" width="14" height="15" rx="2.2"></rect>
				<path d="M9 4.5V3h6v1.5"></path>
			</svg>
		`;
	}

	function chart() {
		return `
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5h16"></path>
				<path d="M7.5 19.5v-6.5"></path>
				<path d="M12 19.5v-10"></path>
				<path d="M16.5 19.5V9.5"></path>
			</svg>
		`;
	}

	function chat() {
		return `
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<path d="M5 18.5 3 21v-4.5"></path>
				<rect x="3" y="4" width="18" height="13.5" rx="2.5"></rect>
			</svg>
		`;
	}

	function user() {
		return `
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="9" r="3.2"></circle>
				<path d="M6.5 19.5a5.5 5.5 0 0 1 11 0"></path>
				<path d="M6.5 19.5h11"></path>
			</svg>
		`;
	}

	function trophy() {
		return `
			<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8 5h8v2.5a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V5Z"></path>
				<path d="M8 7H6a2 2 0 0 0-2 2h0a2 2 0 0 0 2 2H8"></path>
				<path d="M16 7h2a2 2 0 0 1 2 2h0a2 2 0 0 1-2 2H16"></path>
				<path d="M12 11v3.5"></path>
				<path d="M10 19h4"></path>
				<path d="M11 14.5h2"></path>
			</svg>
		`;
	}

	function deriveActive(pathname = '') {
		if (active) return active;
		const items = navItemsByRole[role] || navItemsByRole.coach;
		const match = items.find((item) => pathname.startsWith(item.href));
		if (match) return match.id;
		if (pathname === '/coach' && role === 'coach') return 'dashboard';
		if (pathname === '/athlete' && role === 'athlete') return 'dashboard';
		if (pathname === '/referee' && role === 'referee') return 'dashboard';
		return items[0]?.id || '';
	}

	$: currentPath = $page?.url?.pathname || '';
	$: navItems = navItemsByRole[role] || navItemsByRole.coach;
	$: activeId = deriveActive(currentPath);
	$: logoHref =
		role === 'coach'
			? '/coach/dashboard'
			: role === 'athlete'
				? '/athlete/dashboard'
				: role === 'referee'
					? '/referee/dashboard'
					: navItems?.[0]?.href || '/';
</script>

<nav class="topbar">
	<div class="container topbar-inner">
		<div class="top-left">
			<a class="logo" href={logoHref} sveltekit:prefetch aria-label="Zur Startseite">
				<span class="logo-square" aria-hidden="true">{@html trophy()}</span>
				<span class="logo-text">Karate Performance Evaluator</span>
			</a>
		</div>
		<div class="top-right" role="navigation" aria-label="Hauptnavigation">
			{#each navItems as item}
				<a
					class={`nav-item ${activeId === item.id ? 'active' : ''}`}
					href={item.href}
					sveltekit:prefetch
					aria-current={activeId === item.id ? 'page' : undefined}
				>
					<span class="nav-ico" aria-hidden="true">{@html icon(item.icon)}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/each}
		</div>
	</div>
</nav>

<style>
	.topbar{
		height:64px;
		padding:0;
		background:#fff;
		border-bottom:1px solid #eef2f6;
	}
	.container{max-width:1200px;margin:0 auto;padding:0 20px}
	.topbar-inner{
		display:flex;
		align-items:center;
		justify-content:space-between;
		height:64px;
		gap:18px;
		flex-wrap:wrap;
	}
	.top-left{display:flex;align-items:center;gap:12px}
	.logo{
		display:flex;
		align-items:center;
		gap:10px;
		font-weight:700;
		color:#0f1724;
		border:0;
		background:transparent;
		cursor:pointer;
		padding:0;
		text-decoration:none;
	}
	.logo:visited{color:#0f1724;text-decoration:none;}
	.logo:hover{text-decoration:none;}
	.logo-square{
		width:44px;
		height:44px;
		border-radius:12px;
		background:#e11d2f;
		display:inline-flex;
		align-items:center;
		justify-content:center;
		color:#fff;
	}
	.logo-square svg{display:block;width:28px;height:28px}
	.logo-text{font-weight:800;color:#0f1724;font-size:20px}

	.top-right{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
	.nav-item{
		display:inline-flex;
		align-items:center;
		gap:8px;
		padding:8px 14px;
		border-radius:12px;
		color:#1f2937;
		background:transparent;
		border:1px solid rgba(15,23,36,0.08);
		font-weight:600;
		font-size:14.5px;
		cursor:pointer;
		text-decoration:none;
		transition:transform .12s ease,background .12s ease,box-shadow .12s ease,color .12s ease,border-color .12s ease,text-decoration .12s ease;
	}
	.nav-item:visited{color:#1f2937;text-decoration:none;}
	.nav-ico{
		display:inline-flex;
		align-items:center;
		justify-content:center;
		color:inherit;
	}
	.nav-item:hover{background:rgba(15,23,36,0.04);transform:translateY(-1px)}
	.nav-item:active{transform:translateY(0)}
	.nav-item.active{
		background:#e11d2f;
		color:#fff;
		border-color:#e11d2f;
		box-shadow:0 8px 18px rgba(225,29,47,0.16);
	}
	.nav-item.active .nav-ico svg{stroke:#fff}
	.nav-label{display:inline-block}
	.nav-item:focus{outline:none}
	.nav-item:focus-visible{box-shadow:0 0 0 4px rgba(225,29,47,0.14)}

	@media (max-width:700px){
		.container{padding:0 12px}
		.topbar{height:auto}
		.topbar-inner{height:auto;padding:10px 0}
		.nav-item{padding:0 0;font-size:13px;height:44px;width:44px;border-radius:12px;justify-content:center}
		.nav-ico svg{width:18px;height:18px}
		.nav-label{display:none}
	}
</style>
