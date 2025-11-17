<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Karate Performance Evaluator</title>
</svelte:head>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
	}

	nav {
		background-color: #2c3e50;
		padding: 1rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	nav a {
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background-color 0.3s;
	}

	nav a:hover {
		background-color: #34495e;
	}

	.nav-title {
		font-weight: bold;
		font-size: 1.2rem;
		margin-right: auto;
	}

	main {
		flex: 1;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}
</style>

<div class="app-container">
	<nav>
		<ul>
			<li class="nav-title">Karate Performance Evaluator</li>
			<li><a href="/">Dashboard</a></li>
			<li><a href="/evaluation">Evaluation</a></li>
			<li><a href="/analysis">Analysis</a></li>
			<li><a href="/profile">Profile</a></li>
		</ul>
	</nav>
	<main>
		{@render children()}
	</main>
</div>
