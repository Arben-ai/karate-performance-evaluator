<script>
	export let title = '';
	export let subtitle = 'Inhalte folgen.';
</script>

<main class="container">
	<header class="page-header">
		<h1>{title}</h1>
		<p class="muted">{subtitle}</p>
	</header>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 24px auto;
		padding: 0 20px;
	}
	.page-header h1 {
		margin: 0;
		font-weight: 700;
		font-size: 28px;
	}
	.muted {
		color: #6b7280;
		margin-top: 6px;
	}
</style>
