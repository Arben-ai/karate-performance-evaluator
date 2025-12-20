<script>
	import NavBar from '$lib/NavBar.svelte';
	import PlaceholderPage from '$lib/components/PlaceholderPage.svelte';

	const title = 'Athlet - Übersicht';
</script>

<div class="app-shell">
	<NavBar active="dashboard" />
	<PlaceholderPage {title} />
</div>
