<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

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

      <button class="nav-item" type="button" on:click={() => goto('/bewertung')}><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>
      </span><span class="nav-label">Bewertung</span></button>

      <button class="nav-item" type="button" on:click={() => goto('/analyse')}><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 13v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17v-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 11v-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Analyse</span></button>

      <button class="nav-item" type="button" on:click={() => goto('/feedback')}><span class="nav-ico">
        <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span><span class="nav-label">Feedback</span></button>

      <button class="nav-item" type="button" on:click={() => goto('/profil')}><span class="nav-ico">
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
      <a href="/bewertung" class="card white">
        <div class="card-ico red"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v4H9z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Neue Bewertung</h3>
          <p class="small">Starten Sie eine neue Performance-Bewertung</p>
        </div>
      </a>

      <a href="/analyse" class="card white">
        <div class="card-ico black"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h4v14H3zM9 9h4v8H9zM15 5h4v12h-4z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Analyse</h3>
          <p class="small">Leistungsentwicklung analysieren</p>
        </div>
      </a>

      <a href="/feedback" class="card white">
        <div class="card-ico dark"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Feedback</h3>
          <p class="small">Feedback einsehen und verwalten</p>
        </div>
      </a>

      <a href="/profil" class="card white">
        <div class="card-ico grey"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="card-body">
          <h3>Profil</h3>
          <p class="small">Einstellungen und Profildaten</p>
        </div>
      </a>
    </section>

    <section class="grid-bottom">
      <div class="panel stats">
        <h4>Übersicht</h4>
        <div class="stats-list">
          <div class="row"><div class="k">Bewertungen diese Woche</div><div class="v">8</div></div>
          <div class="row"><div class="k">Aktive Athleten</div><div class="v">4</div></div>
          <div class="row"><div class="k">Ausstehende Bewertungen</div><div class="v">3</div></div>
        </div>
        <div class="trend"> <span class="up">▲ Gute Fortschritte</span></div>
      </div>

      <div class="panel top-performers">
        <h4>Top Performer</h4>
        <ol class="top-list">
          <li>
            <div class="pos pos-1">1</div>
            <div class="tp-body">
              <div class="tp-name">Anna Schmidt <div class="tp-sub">Kihon</div></div>
            </div>
            <div class="tp-score">90</div>
          </li>
          <li>
            <div class="pos pos-2">2</div>
            <div class="tp-body">
              <div class="tp-name">Sarah Weber <div class="tp-sub">Kata</div></div>
            </div>
            <div class="tp-score">87</div>
          </li>
          <li>
            <div class="pos pos-3">3</div>
            <div class="tp-body">
              <div class="tp-name">Marc Müller <div class="tp-sub">Kumite</div></div>
            </div>
            <div class="tp-score">82</div>
          </li>
        </ol>
      </div>

      <div class="panel attention">
        <h4>Benötigt Aufmerksamkeit</h4>
        <div class="attention-list">
          <div class="att-item">
            <div class="att-title">David Klein</div>
            <div class="att-desc">Score unter 80<br/><span class="att-meta">Letzte Bewertung: 10.11.2025</span></div>
          </div>
          <div class="att-item">
            <div class="att-title">Laura Fischer</div>
            <div class="att-desc">Keine Bewertung seit 2 Wochen<br/><span class="att-meta">Letzte Bewertung: 01.11.2025</span></div>
          </div>
        </div>
      </div>
</section>

    <section class="athletes-section">
      <div class="athletes-header">
        <div>
          <h3><span class="header-ico">👥</span> Athleten-Übersicht</h3>
          <p class="muted">Alle Athleten, die Sie betreuen</p>
        </div>
        <div class="athlete-count">4 Athleten</div>
      </div>

      <div class="athlete-grid">
        <article class="athlete-card">
          <div class="athlete-top">
            <div class="avatar">S</div>
            <div class="athlete-info">
              <div class="athlete-name">Sarah Weber</div>
              <div class="athlete-discipline">Kata</div>
            </div>
          </div>
          <hr />
          <div class="athlete-stats">
            <div>
              <div class="stat-label">Letzter Score</div>
              <div class="stat-value">87</div>
            </div>
            <div>
              <div class="stat-label">Bewertungen</div>
              <div class="stat-value">8</div>
            </div>
          </div>
        </article>

        <article class="athlete-card">
          <div class="athlete-top">
            <div class="avatar">M</div>
            <div class="athlete-info">
              <div class="athlete-name">Marc Müller</div>
              <div class="athlete-discipline">Kumite</div>
            </div>
          </div>
          <hr />
          <div class="athlete-stats">
            <div>
              <div class="stat-label">Letzter Score</div>
              <div class="stat-value">82</div>
            </div>
            <div>
              <div class="stat-label">Bewertungen</div>
              <div class="stat-value">6</div>
            </div>
          </div>
        </article>

        <article class="athlete-card">
          <div class="athlete-top">
            <div class="avatar">A</div>
            <div class="athlete-info">
              <div class="athlete-name">Anna Schmidt</div>
              <div class="athlete-discipline">Kihon</div>
            </div>
          </div>
          <hr />
          <div class="athlete-stats">
            <div>
              <div class="stat-label">Letzter Score</div>
              <div class="stat-value">90</div>
            </div>
            <div>
              <div class="stat-label">Bewertungen</div>
              <div class="stat-value">7</div>
            </div>
          </div>
        </article>

        <article class="athlete-card">
          <div class="athlete-top">
            <div class="avatar">D</div>
            <div class="athlete-info">
              <div class="athlete-name">David Klein</div>
              <div class="athlete-discipline">Kata</div>
            </div>
          </div>
          <hr />
          <div class="athlete-stats">
            <div>
              <div class="stat-label">Letzter Score</div>
              <div class="stat-value">78</div>
            </div>
            <div>
              <div class="stat-label">Bewertungen</div>
              <div class="stat-value">5</div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="recent-evals">
      <h4>Letzte Bewertungen</h4>
      <div class="eval-list">
        <div class="eval-item">
          <div class="eval-left">
            <div class="eval-avatar">S</div>
            <div>
              <div class="eval-name">Sarah Weber</div>
              <div class="eval-meta">Kata • 15.11.2025</div>
            </div>
          </div>
          <div class="eval-score">
            <div class="value">87</div>
            <div class="label">Punkte</div>
          </div>
        </div>

        <div class="eval-item">
          <div class="eval-left">
            <div class="eval-avatar">M</div>
            <div>
              <div class="eval-name">Marc Müller</div>
              <div class="eval-meta">Kumite • 14.11.2025</div>
            </div>
          </div>
          <div class="eval-score">
            <div class="value">82</div>
            <div class="label">Punkte</div>
          </div>
        </div>

        <div class="eval-item">
          <div class="eval-left">
            <div class="eval-avatar">A</div>
            <div>
              <div class="eval-name">Anna Schmidt</div>
              <div class="eval-meta">Kihon • 13.11.2025</div>
            </div>
          </div>
          <div class="eval-score">
            <div class="value">90</div>
            <div class="label">Punkte</div>
          </div>
        </div>
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
  .page-header h1{margin:0;font-weight:700;font-size:28px;line-height:1.05;margin-bottom:8px}
  .muted{color:#6b7280;margin-top:6px;font-size:14px}

  .grid-top{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:18px}
  .card.white{background:#fff;border-radius:12px;padding:20px;display:flex;gap:14px;align-items:flex-start;box-shadow:0 8px 24px rgba(15,23,36,0.06)}
  /* anchors used as cards should not look like links */
  a.card.white, a.card.white:link, a.card.white:visited{color:inherit;text-decoration:none;cursor:pointer;display:flex}
  a.card.white *{color:inherit}
  .card-ico{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:6px;box-shadow:0 4px 12px rgba(2,6,11,0.06)}
  .card-ico svg{width:20px;height:20px;display:block}
  .card-ico.red{background:#e11d2f;color:#fff}
  .card-ico.black{background:#111;color:#fff}
  .card-ico.dark{background:#0f1724;color:#fff}
  .card-ico.grey{background:#f3f4f6;color:#374151}
  /* ensure the SVG strokes use the intended color for contrast */
  .card-ico.red svg{stroke:#fff !important;fill:none !important}
  .card-ico.black svg{stroke:#fff !important;fill:none !important}
  .card-ico.dark svg{stroke:#fff !important;fill:none !important}
  .card-ico.grey svg{stroke:#374151 !important;fill:none !important}
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

  /* Top Performer styles */
  .top-list{list-style:none;padding:0;margin:6px 0 0}
  .top-list li{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f3f4f6}
  .pos{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#fff}
  .pos-1{background:#f59e0b}
  .pos-2{background:#9ca3af}
  .pos-3{background:#fb923c}
  .tp-body{flex:1}
  .tp-name{font-weight:700}
  .tp-sub{font-size:13px;color:#6b7280;margin-top:4px}
  .tp-score{font-weight:700}

  /* Attention panel */
  .attention-list{display:flex;flex-direction:column;gap:12px;margin-top:8px}
  .att-item{border:1px solid #fde8dc;background:#fff7f0;padding:14px;border-radius:8px}
  .att-title{font-weight:700;margin-bottom:6px}
  .att-desc{color:#b3471e;margin:0;font-size:14px}
  .att-meta{display:block;color:#8b5e3c;font-size:13px;margin-top:8px}

  /* Athletes overview */
  .athletes-section{margin-top:28px}
  .athletes-section{margin-top:20px;background:#fff;border-radius:12px;padding:12px 22px 20px;border:1px solid #eef2f6;box-shadow:0 12px 36px rgba(15,23,36,0.04)}
  .athletes-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .athletes-header h3{margin:0;font-size:18px}
  .athletes-header p{margin:6px 0 0}
  .header-ico{display:inline-block;margin-right:8px;background:#feeceb;color:#e11d2f;padding:6px;border-radius:8px;font-size:13px}
  .athlete-count{background:#f3f4f6;padding:8px 12px;border-radius:14px;color:#374151;font-weight:600;font-size:13px}
  .athlete-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .athlete-card{background:#fff;border-radius:12px;padding:18px;box-shadow:0 8px 24px rgba(15,23,36,0.04);min-height:140px}
  .athlete-top{display:flex;gap:14px;align-items:center}
  .avatar{width:56px;height:56px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px}
  .athlete-name{font-weight:700;font-size:15px}
  .athlete-discipline{color:#6b7280;margin-top:6px;font-size:13px}
  .athlete-stats{display:flex;justify-content:space-between;margin-top:14px}
  .stat-label{color:#9ca3af;font-size:13px}
  .stat-value{font-weight:700;margin-top:6px;font-size:16px}

  /* previously used charts; keep canvas rule in case charts re-added */
  :global(canvas){width:100% !important;height:160px !important}

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
    .athlete-grid{grid-template-columns:1fr}
  }

  @media (max-width:700px){
    .athlete-grid{grid-template-columns:1fr 1fr}
  }

  /* Recent evaluations */
  .recent-evals{margin-top:20px;background:#fff;border-radius:12px;padding:16px;border:1px solid #eef2f6;box-shadow:0 8px 24px rgba(15,23,36,0.04)}
  .recent-evals h4{margin:0 0 12px}
  .eval-list{display:flex;flex-direction:column;gap:12px}
  .eval-item{display:flex;align-items:center;justify-content:space-between;background:#fafafb;padding:14px;border-radius:8px}
  .eval-left{display:flex;align-items:center;gap:12px}
  .eval-avatar{width:44px;height:44px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
  .eval-name{font-weight:700}
  .eval-meta{color:#6b7280;font-size:13px;margin-top:4px}
  .eval-score{text-align:right}
  .eval-score .value{font-weight:700}
  .eval-score .label{color:#6b7280;font-size:13px}

  @media (max-width:800px){
    .eval-item{padding:12px}
    .eval-avatar{width:40px;height:40px}
  }

</style>
