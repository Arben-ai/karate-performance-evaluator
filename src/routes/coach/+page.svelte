<script>
  import { onMount, onDestroy } from 'svelte';

  let coachName = 'Daniel';

  // Chart.js instances
  let radarChart;
  let lineChart;

  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.Chart) return resolve(window.Chart);
      const el = document.createElement('script');
      el.src = src;
      el.onload = () => resolve(window.Chart);
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  function fetchMockData() {
    // simulate API latency
    return new Promise((res) => {
      setTimeout(() => {
        res({
          stats: { weekCount: 12, avgScore: 85.3, activeAthletes: 24, trend: 8 },
          radar: {
            labels: ['Präzision', 'Technik', 'Geschwindigkeit', 'Fokus', 'Ausdruck'],
            data: [75, 82, 68, 88, 80]
          },
          line: {
            labels: ['KW 1', 'KW 2', 'KW 3', 'KW 4', 'KW 5'],
            data: [75, 78, 81, 84, 86]
          }
        });
      }, 300);
    });
  }

  onMount(async () => {
    // load Chart.js from CDN
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    } catch (e) {
      console.warn('Chart.js load failed', e);
      return;
    }

    const mock = await fetchMockData();

    // radar
    const ctxRadar = document.getElementById('radar-canvas');
    if (ctxRadar && window.Chart) {
      radarChart = new window.Chart(ctxRadar.getContext('2d'), {
        type: 'radar',
        data: {
          labels: mock.radar.labels,
          datasets: [{
            label: 'Performance',
            data: mock.radar.data,
            backgroundColor: 'rgba(225,29,47,0.18)',
            borderColor: '#e11d2f',
            pointBackgroundColor: '#e11d2f'
          }]
        },
        options: {
          scales: { r: { beginAtZero: true, max: 100 } },
          plugins: { legend: { display: false } }
        }
      });
    }

    // line
    const ctxLine = document.getElementById('line-canvas');
    if (ctxLine && window.Chart) {
      lineChart = new window.Chart(ctxLine.getContext('2d'), {
        type: 'line',
        data: {
          labels: mock.line.labels,
          datasets: [{
            label: 'Entwicklung',
            data: mock.line.data,
            borderColor: '#e11d2f',
            backgroundColor: 'rgba(225,29,47,0.06)',
            fill: true,
            tension: 0.25,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, suggestedMax: 100 }
          }
        }
      });
    }
  });

  onDestroy(() => {
    try { radarChart?.destroy(); } catch (e) {}
    try { lineChart?.destroy(); } catch (e) {}
  });
</script>

<div class="app-shell">
    <nav class="topbar">
      <div class="container topbar-inner">
        <div class="top-left">
          <div class="logo"> <span class="logo-ico">🏆</span> <span class="logo-text">KPE</span> </div>
        </div>
        <div class="top-right" role="navigation" aria-label="Hauptnavigation">
      <button class="nav-item active" type="button"><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Dashboard</span></button>

      <button class="nav-item" type="button"><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>
      </span><span class="nav-label">Bewertung</span></button>

      <button class="nav-item" type="button"><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 13v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17v-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 11v-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Analyse</span></button>

      <button class="nav-item" type="button"><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Feedback</span></button>

      <button class="nav-item" type="button"><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Profil</span></button>
    </div>
      </div>
  </nav>

  <main class="container">
    <header class="page-header">
      <div>
        <h1>Willkommen zurück, Coach {coachName}</h1>
        <p class="muted">Hier ist Ihre Performance-Übersicht</p>
      </div>
    </header>

    <section class="grid-top">
      <div class="card white">
        <div class="card-ico red"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v4H9z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Neue Bewertung</h3>
          <p class="small">Starten Sie eine neue Performance-Bewertung</p>
        </div>
      </div>

      <div class="card white">
        <div class="card-ico black"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h4v14H3zM9 9h4v8H9zM15 5h4v12h-4z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Analyse</h3>
          <p class="small">Leistungsentwicklung analysieren</p>
        </div>
      </div>

      <div class="card white">
        <div class="card-ico dark"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Feedback</h3>
          <p class="small">Feedback einsehen und verwalten</p>
        </div>
      </div>

      <div class="card white">
        <div class="card-ico grey"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Profil</h3>
          <p class="small">Einstellungen und Profildaten</p>
        </div>
      </div>
    </section>

    <section class="grid-bottom">
      <div class="panel stats">
        <h4>Schnellstatistik</h4>
        <div class="stats-list">
          <div class="row"><div class="k">Bewertungen diese Woche</div><div class="v">12</div></div>
          <div class="row"><div class="k">Durchschnittsscore</div><div class="v">85.3</div></div>
          <div class="row"><div class="k">Aktive Athleten</div><div class="v">24</div></div>
        </div>
        <div class="trend"> <span class="up">▲ +8% vs. letzte Woche</span></div>
      </div>

      <div class="panel chart">
        <h4>Performance-Profil</h4>
        <canvas id="radar-canvas" width="400" height="160"></canvas>
      </div>

      <div class="panel chart">
        <h4>Entwicklung</h4>
        <canvas id="line-canvas" width="400" height="160"></canvas>
      </div>
    </section>
  </main>
</div>

<style>
  :global(body){font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; background:#f7f8fb; overflow-x:hidden}
  .topbar{height:64px;padding:0;background:#fff;border-bottom:1px solid #eef2f6}
  .topbar .topbar-inner{display:flex;align-items:center;justify-content:space-between;height:64px;gap:18px;flex-wrap:wrap}
  .logo{display:flex;gap:10px;align-items:center;font-weight:700;color:#e11d2f}
  .logo-ico{background:#e11d2f;color:#fff;padding:8px;border-radius:8px}
  .top-right{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .nav-item{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:999px;color:#374151;background:transparent;border:1px solid rgba(15,23,36,0.06);font-weight:600;font-size:15px;cursor:pointer;transition:transform .12s ease,background .12s ease,box-shadow .12s ease;flex:0 0 auto;white-space:nowrap}
  .nav-ico{display:inline-flex;align-items:center;justify-content:center;color:inherit}
  .nav-item:hover{background:rgba(15,23,36,0.03);transform:translateY(-1px)}
  .nav-item:active{transform:translateY(0)}
  .nav-item.active{background:#e11d2f;color:#fff;border-color:#e11d2f;box-shadow:0 6px 18px rgba(225,29,47,0.08)}
  .nav-label{display:inline-block}
  .nav-item:focus{outline:none}
  .nav-item:focus-visible{box-shadow:0 0 0 4px rgba(225,29,47,0.12)}

  .container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-weight:600}
  .muted{color:#6b7280;margin-top:6px}

  .grid-top{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:18px}
  .card.white{background:#fff;border-radius:12px;padding:20px;display:flex;gap:14px;align-items:flex-start;box-shadow:0 6px 18px rgba(15,23,36,0.06)}
  .card-ico{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center}
  .card-ico.red{background:#feecec;color:#e11d2f}
  .card-ico.black{background:#111;color:#fff}
  .card-ico.dark{background:#111;color:#fff}
  .card-ico.grey{background:#f3f4f6;color:#374151}
  .card-body h3{margin:0 0 8px;font-size:16px}
  .small{color:#6b7280;margin:0;font-size:13px}

  .grid-bottom{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:22px}
  .panel{background:#fff;border-radius:12px;padding:18px;box-shadow:0 6px 18px rgba(15,23,36,0.06)}
  .panel h4{margin:0 0 10px}

  .stats-list{margin-top:8px}
  .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6}
  .row .k{color:#6b7280}
  .row .v{font-weight:700}
  .trend{margin-top:12px;color:#10b981}

  canvas{width:100% !important;height:160px !important}

  /* Responsive adjustments to avoid overlap and horizontal scroll */
  @media (max-width:900px){
    .nav-item{padding:7px 12px;font-size:14px}
  }

  @media (max-width:700px){
    .topbar .topbar-inner{height:auto;padding:10px 0}
    .nav-item{padding:0 0;font-size:13px;height:44px;width:44px;border-radius:12px;justify-content:center}
    .nav-ico svg{width:18px;height:18px}
    .nav-label{display:none}
    .container{padding:0 12px}
    .page-header h1{font-size:22px}
  }

  @media (max-width:1000px){
    .grid-top{grid-template-columns:1fr 1fr}
    .grid-bottom{grid-template-columns:1fr}
  }

</style>
