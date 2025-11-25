<script>
  import { goto } from '$app/navigation';
</script>

<div class="app-shell">
  <nav class="topbar">
    <div class="container topbar-inner">
      <div class="top-left">
        <div class="logo"> <span class="logo-ico">🏆</span> <span class="logo-text">KPE</span> </div>
      </div>
      <div class="top-right" role="navigation" aria-label="Hauptnavigation">
        <button class="nav-item" type="button" on:click={() => goto('/coach')}><span class="nav-ico">🏠</span><span class="nav-label">Dashboard</span></button>
        <button class="nav-item active" type="button" on:click={() => goto('/bewertung')}><span class="nav-ico">🗒️</span><span class="nav-label">Bewertung</span></button>
        <button class="nav-item" type="button" on:click={() => goto('/analyse')}><span class="nav-ico">📊</span><span class="nav-label">Analyse</span></button>
        <button class="nav-item" type="button" on:click={() => goto('/feedback')}><span class="nav-ico">💬</span><span class="nav-label">Feedback</span></button>
        <button class="nav-item" type="button" on:click={() => goto('/profil')}><span class="nav-ico">👤</span><span class="nav-label">Profil</span></button>
      </div>
    </div>
  </nav>

  <main class="container">
    <header class="page-header">
      <h1>Neue Bewertung</h1>
      <p class="muted">Erfassen Sie eine Performance-Bewertung für einen Athleten</p>
    </header>

    <section style="margin-top:20px">
      <!-- placeholder: form or content will be added here -->
    </section>
  </main>
</div>

<style>
  :global(body){font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; background:#f7f8fb}
  .topbar{height:64px;padding:0;background:#fff;border-bottom:1px solid #eef2f6}
  .topbar .topbar-inner{display:flex;align-items:center;justify-content:space-between;height:64px;gap:18px;flex-wrap:wrap}
  .logo{display:flex;gap:10px;align-items:center;font-weight:700;color:#e11d2f}
  .logo-ico{background:#e11d2f;color:#fff;padding:8px;border-radius:8px}
  .top-right{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .nav-item{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:999px;color:#374151;background:transparent;border:1px solid rgba(15,23,36,0.06);font-weight:600;font-size:15px;cursor:pointer;transition:transform .12s ease,background .12s ease,box-shadow .12s ease}
  .nav-ico{display:inline-flex;align-items:center;justify-content:center;color:inherit}
  .nav-item:hover{background:rgba(15,23,36,0.03);transform:translateY(-1px)}
  .nav-item.active{background:#e11d2f;color:#fff;border-color:#e11d2f;box-shadow:0 6px 18px rgba(225,29,47,0.08)}
  .nav-label{display:inline-block}

  .container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-weight:700;font-size:28px}
  .muted{color:#6b7280;margin-top:6px}

  @media (max-width:700px){
    .nav-item{padding:0 0;font-size:13px;height:44px;width:44px;border-radius:12px;justify-content:center}
    .nav-label{display:none}
    .container{padding:0 12px}
  }
</style>
