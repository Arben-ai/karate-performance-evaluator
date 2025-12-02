<script>
  import NavBar from '$lib/NavBar.svelte';

  const athletes = ['Sarah Weber', 'Marc Müller', 'Anna Schmidt', 'David Klein'];
  const ranges = ['Letzte 3 Monate', 'Letzte 6 Monate', 'Letzte 12 Monate'];

  let selectedAthlete = 'Sarah Weber';
  let selectedRange = 'Letzte 3 Monate';
</script>

<div class="app-shell">
  <NavBar active="analyse" />

  <main class="page container">
    <header class="page-header">
      <h1>Performance Analyse</h1>
      <p class="muted">Detaillierte Leistungsauswertung und Entwicklung</p>
    </header>

    <section class="card filters">
      <div class="field">
        <label for="athlete">Athlet auswählen</label>
        <select id="athlete" bind:value={selectedAthlete}>
          {#each athletes as a}
            <option value={a}>{a}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <label for="range">Zeitraum</label>
        <select id="range" bind:value={selectedRange}>
          {#each ranges as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric card">
        <div class="metric-ico">🏅</div>
        <div class="metric-body">
          <div class="metric-value">89.7</div>
          <div class="metric-title">Durchschnittsscore</div>
          <div class="metric-delta up">+5.2</div>
        </div>
      </div>
      <div class="metric card">
        <div class="metric-ico">🎯</div>
        <div class="metric-body">
          <div class="metric-title">Kihon</div>
          <div class="metric-sub">Beste Disziplin</div>
          <div class="metric-delta link">92 Punkte</div>
        </div>
      </div>
      <div class="metric card">
        <div class="metric-ico">⚡</div>
        <div class="metric-body">
          <div class="metric-title">Geschwindigkeit</div>
          <div class="metric-sub">Verbesserungspotenzial</div>
          <div class="metric-delta">75 Punkte</div>
        </div>
      </div>
      <div class="metric card">
        <div class="metric-ico">📈</div>
        <div class="metric-body">
          <div class="metric-value">72</div>
          <div class="metric-title">Trainingseinheiten</div>
          <div class="metric-delta up">+12 vs. Vorperiode</div>
        </div>
      </div>
    </section>

    <section class="chart-grid">
      <div class="card chart">
        <div class="chart-header">Kompetenzprofil</div>
        <div class="chart-body">
          <svg viewBox="0 0 240 200" aria-hidden="true">
            <polygon points="120,30 200,80 175,165 65,165 40,80" fill="#e11d2f" opacity="0.18"></polygon>
            <polygon points="120,20 210,80 185,180 55,180 30,80" fill="#8b9bb7" opacity="0.2"></polygon>
            <text x="120" y="18" text-anchor="middle" font-size="10" fill="#666">Präzision</text>
            <text x="205" y="90" font-size="10" fill="#666">Technik</text>
            <text x="170" y="192" font-size="10" fill="#666">Geschwindigkeit</text>
            <text x="70" y="192" font-size="10" fill="#666">Fokus</text>
            <text x="32" y="90" font-size="10" fill="#666">Ausdruck</text>
            <rect x="70" y="200" width="12" height="12" fill="#e11d2f"></rect>
            <text x="88" y="210" font-size="11" fill="#333">Aktuell</text>
            <rect x="140" y="200" width="12" height="12" fill="#8b9bb7"></rect>
            <text x="158" y="210" font-size="11" fill="#333">Benchmark</text>
          </svg>
        </div>
      </div>

      <div class="card chart">
        <div class="chart-header">Disziplin-Vergleich</div>
        <div class="chart-body bars">
          <div class="bar">
            <div class="bar-fill" style="height:90%"></div>
            <div class="bar-label">Kata</div>
            <div class="bar-sub">24 Sessions</div>
          </div>
          <div class="bar">
            <div class="bar-fill" style="height:86%"></div>
            <div class="bar-label">Kumite</div>
            <div class="bar-sub">20 Sessions</div>
          </div>
          <div class="bar">
            <div class="bar-fill" style="height:92%"></div>
            <div class="bar-label">Kihon</div>
            <div class="bar-sub">28 Sessions</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card line-chart">
      <div class="chart-header">Entwicklung über Zeit</div>
      <svg viewBox="0 0 900 260" aria-hidden="true" class="line-svg">
        <polyline points="40,200 200,190 360,180 520,172 680,165 840,158" fill="none" stroke="#e11d2f" stroke-width="3"></polyline>
        <polyline points="40,205 200,194 360,184 520,175 680,168 840,160" fill="none" stroke="#2b2d42" stroke-width="3"></polyline>
        <polyline points="40,198 200,188 360,178 520,170 680,163 840,156" fill="none" stroke="#0d9488" stroke-width="3"></polyline>
        <line x1="40" y1="220" x2="840" y2="220" stroke="#d9dce2" stroke-width="1"></line>
        <text x="40" y="235" font-size="12" fill="#666">Sep</text>
        <text x="200" y="235" font-size="12" fill="#666">Okt</text>
        <text x="360" y="235" font-size="12" fill="#666">Nov</text>
        <text x="520" y="235" font-size="12" fill="#666">Dez</text>
        <text x="680" y="235" font-size="12" fill="#666">Jan</text>
        <text x="840" y="235" font-size="12" fill="#666">Feb</text>
      </svg>
    </section>

    <section class="strength-grid">
      <div class="card strengths">
        <div class="chart-header">Stärken</div>
        <div class="pill-list green">
          <div class="pill-item"><span class="dot green"></span>Technik</div>
          <div class="pill-item"><span class="dot green"></span>Fokus</div>
          <div class="pill-item"><span class="dot green"></span>Präzision</div>
        </div>
      </div>
      <div class="card weaknesses">
        <div class="chart-header">Verbesserungspotenzial</div>
        <div class="pill-list orange">
          <div class="pill-item"><span class="dot orange"></span>Geschwindigkeit</div>
        </div>
        <div class="hint">
          Empfehlung: Fokus auf Speed-Drills und Reaktionsübungen zur Verbesserung der Geschwindigkeit.
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-size:28px;font-weight:700}
  .page-header .muted{margin:4px 0 0;color:#6b7280;font-size:14px}

  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}

  .filters{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px}
  .field label{display:block;font-weight:600;font-size:13px;margin-bottom:6px;color:#111}
  .field select{width:100%;padding:12px;border-radius:10px;border:1px solid #e5e7eb;background:#f5f6f9;color:#111}

  .metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}
  .metric{display:flex;gap:12px;padding:14px}
  .metric-ico{width:34px;height:34px;border-radius:10px;background:#f7f8fb;display:flex;align-items:center;justify-content:center;font-size:16px}
  .metric-body{display:flex;flex-direction:column;gap:4px}
  .metric-value{font-size:18px;font-weight:700}
  .metric-title{font-weight:700;font-size:14px}
  .metric-sub{color:#6b7280;font-size:13px}
  .metric-delta{color:#111;font-size:13px;font-weight:700}
  .metric-delta.up{color:#0ea854}
  .metric-delta.link{color:#0ea854}

  .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
  .chart{padding:14px}
  .chart-header{font-weight:700;margin-bottom:10px}
  .chart-body{display:flex;align-items:center;justify-content:center;min-height:220px}
  .chart-body svg{max-width:100%}

  .chart-body.bars{align-items:flex-end;gap:20px;padding:20px}
  .bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
  .bar-fill{width:60px;background:#e11d2f;border-radius:10px 10px 4px 4px;box-shadow:0 8px 12px rgba(225,29,47,0.15)}
  .bar-label{font-weight:700;font-size:14px}
  .bar-sub{color:#6b7280;font-size:13px}

  .line-chart{margin-top:16px;padding:14px}
  .line-svg{width:100%;height:auto}

  .strength-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
  .strengths, .weaknesses{padding:14px}
  .pill-list{display:flex;flex-direction:column;gap:10px}
  .pill-item{background:rgba(16,185,129,0.12);border-radius:10px;padding:10px 12px;font-weight:600;color:#065f46}
  .pill-list.orange .pill-item{background:rgba(251,146,60,0.12);color:#9a3412}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}
  .dot.green{background:#0ea854}
  .dot.orange{background:#f59e0b}
  .hint{margin-top:10px;padding:10px 12px;background:#f7f8fb;border-radius:10px;color:#374151;font-size:13px;border:1px solid #eef1f5}

  @media (max-width:1000px){
    .content-grid{grid-template-columns:1fr}
    .metric-grid{grid-template-columns:repeat(2,1fr)}
    .chart-grid{grid-template-columns:1fr}
    .strength-grid{grid-template-columns:1fr}
  }

  @media (max-width:640px){
    .metric-grid{grid-template-columns:1fr}
    .filters{grid-template-columns:1fr}
  }
</style>
