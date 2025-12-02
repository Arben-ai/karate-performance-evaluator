<script>
  import NavBar from '$lib/NavBar.svelte';
</script>

<div class="app-shell">
  <NavBar active="dashboard" />

  <main class="container">
    <header class="page-header">
      <h1>Schiedsrichter</h1>
      <p class="muted">Inhalte folgen.</p>
    </header>
  </main>
</div>

<style>
  .container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-weight:700;font-size:28px}
  .muted{color:#6b7280;margin-top:6px}
</style>
