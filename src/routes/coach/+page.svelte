<script>
  import { onMount, onDestroy } from 'svelte';
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  let coachName = 'Daniel';
  let radarChart;
  let lineChart;

  function personIcon() {
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d2f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="9" r="3.2"></circle>
        <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0"></path>
        <path d="M6.5 18.5h11"></path>
      </svg>
    `;
  }

  // safe helper to get an avatar letter without throwing if data is missing
  function avatarLetter(ev) {
    if (!ev) return '?';
    if (ev.athlete && typeof ev.athlete === 'string' && ev.athlete.length) return ev.athlete[0];
    if (ev.name && typeof ev.name === 'string' && ev.name.length) return ev.name[0];
    return '?';
  }

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
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    } catch (e) {
      console.warn('Chart.js load failed', e);
      return;
    }

    const mock = await fetchMockData();

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
  <NavBar active="dashboard" />

  <main class="container">
    <header class="page-header">
      <div>
        <h1>Willkommen zurück, Coach {coachName}</h1>
        <p class="muted">Hier ist Ihre Team-Übersicht</p>
      </div>
    </header>

    <section class="grid-top">
      <a href="/bewertung" class="card white">
        <div class="card-ico red">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="7" y="5.3" width="10" height="13.4" rx="2.1"></rect>
            <path d="M10 4h4"></path>
            <path d="M10 9.8h5"></path>
            <path d="M10 13h3"></path>
            <path d="M10 11.5l1.9 1.9 2.9-2.9"></path>
          </svg>
        </div>
        <div class="card-body">
          <h3>Neue Bewertung</h3>
          <p class="small">Starten Sie eine neue Performance-Bewertung</p>
        </div>
      </a>

      <a href="/analyse" class="card white">
        <div class="card-ico black">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h4v14H3zM9 9h4v8H9zM15 5h4v12h-4z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="card-body">
          <h3>Analyse</h3>
          <p class="small">Leistungsentwicklung analysieren</p>
        </div>
      </a>

      <a href="/feedback" class="card white">
        <div class="card-ico dark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="card-body">
          <h3>Feedback</h3>
          <p class="small">Feedback einsehen und verwalten</p>
        </div>
      </a>

      <a href="/profil" class="card white">
        <div class="card-ico grey">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="9" r="3.2"></circle>
            <path d="M6.5 18.5c.6-2.5 3-4 5.5-4s4.9 1.5 5.5 4"></path>
            <path d="M6.5 18.5h11"></path>
          </svg>
        </div>
        <div class="card-body">
          <h3>Profil</h3>
          <p class="small">Einstellungen und Profildaten</p>
        </div>
      </a>
    </section>

    <section class="grid-bottom">
      <div class="panel stats">
        <h4><span class="heading-ico">🏅</span> Übersicht</h4>
        <div class="stats-list">
          <div class="row"><div class="k">Bewertungen diese Woche</div><div class="v">8</div></div>
          <div class="row"><div class="k">Aktive Athleten</div><div class="v">4</div></div>
          <div class="row"><div class="k">Ausstehende Bewertungen</div><div class="v">3</div></div>
        </div>
        <div class="trend"> <span class="up">↑ Gute Fortschritte</span></div>
      </div>

      <div class="panel top-performers">
        <h4><span class="heading-ico">🏅</span> Top Performer</h4>
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
        <h4><span class="heading-ico danger">!</span> Benötigt Aufmerksamkeit</h4>
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
          <h3><span class="header-ico">{@html personIcon()}</span> Athleten-Übersicht</h3>
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
        {#if !$evaluations || $evaluations.length === 0}
          <div class="eval-item">
            <div class="eval-left">
              <div class="eval-name">Noch keine Bewertungen vorhanden</div>
            </div>
          </div>
        {:else}
          {#each $evaluations.slice(0,3) as ev}
            <div class="eval-item">
              <div class="eval-left">
                <div class="eval-avatar">{avatarLetter(ev)}</div>
                <div>
                  <div class="eval-name">{ev?.name ?? 'Unbekannt'}</div>
                  <div class="eval-meta">{ev?.discipline ?? ''}{ev?.discipline ? ' • ' : ''}{ev?.date ?? ''}</div>
                </div>
              </div>
              <div class="eval-score">
                <div class="value">{ev?.score ?? '-'}</div>
                <div class="label">Punkte</div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </section>

  </main>
</div>

<style>
  :global(body){font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; background:#f7f8fb; overflow-x:hidden}

  .container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-weight:700;font-size:28px;line-height:1.05;margin-bottom:6px}
  .muted{color:#6b7280;margin-top:4px;font-size:15px}

  .grid-top{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:18px}
  .card.white{background:#fff;border-radius:10px;padding:18px;display:flex;gap:12px;align-items:flex-start;border:1px solid #e8ebf0;box-shadow:0 6px 14px rgba(15,23,36,0.045)}
  a.card.white, a.card.white:link, a.card.white:visited{color:inherit;text-decoration:none;cursor:pointer;display:flex}
  a.card.white *{color:inherit}
  .card-ico{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:8px;box-shadow:0 4px 10px rgba(2,6,11,0.08)}
  .card-ico svg{width:18px;height:18px;display:block}
  .card-ico.red{background:#e11d2f;color:#fff}
  .card-ico.black{background:#111;color:#fff}
  .card-ico.dark{background:#0f1724;color:#fff}
  .card-ico.grey{background:#2f3744;color:#fff}
  .card-ico.red svg{stroke:#fff !important;fill:none !important}
  .card-ico.black svg{stroke:#fff !important;fill:none !important}
  .card-ico.dark svg{stroke:#fff !important;fill:none !important}
  .card-ico.grey svg{stroke:#fff !important;fill:none !important}
  .card-body h3{margin:0 0 8px;font-size:16px}
  .small{color:#6b7280;margin:0;font-size:13px}

  .grid-bottom{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:22px}
  .panel{background:#fff;border-radius:12px;padding:18px 18px 14px;border:1px solid #e5e7eb;box-shadow:0 8px 16px rgba(15,23,36,0.05)}
  .panel h4{margin:0 0 12px;display:flex;align-items:center;gap:10px;font-size:17px}
  .heading-ico{display:inline-flex;align-items:center;justify-content:center;color:#e11d2f;font-size:16px}
  .heading-ico.danger{background:#fff0ed;border:1px solid #fcd7cf;color:#e11d2f;width:22px;height:22px;border-radius:6px;font-weight:700;line-height:1}

  .stats-list{margin-top:8px}
  .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6}
  .row .k{color:#6b7280}
  .row .v{font-weight:700}
  .trend{margin-top:12px;color:#10b981}

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

  .attention-list{display:flex;flex-direction:column;gap:12px;margin-top:8px}
  .att-item{border:1px solid #fcd7cf;background:#fff7f0;padding:14px;border-radius:10px}
  .att-title{font-weight:700;margin-bottom:6px}
  .att-desc{color:#b3471e;margin:0;font-size:14px}
  .att-meta{display:block;color:#8b5e3c;font-size:13px;margin-top:8px}

  .athletes-section{margin-top:20px;background:#fff;border-radius:10px;padding:14px 18px 18px;border:1px solid #e8ebf0;box-shadow:0 6px 14px rgba(15,23,36,0.04)}
  .athletes-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .athletes-header h3{margin:0;font-size:18px;display:flex;align-items:center;gap:8px}
  .athletes-header p{margin:4px 0 0}
  .header-ico svg{vertical-align:middle}
  .header-ico{display:inline-flex;align-items:center;justify-content:center}
  .athlete-count{background:#eef1f5;padding:6px 12px;border-radius:999px;color:#111;font-weight:600;font-size:13px;border:1px solid #e2e6ec}
  .athlete-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .athlete-card{background:#f7f8fb;border-radius:12px;padding:14px;border:1px solid #e8ebf0;min-height:130px}
  .athlete-top{display:flex;gap:12px;align-items:center}
  .avatar{width:44px;height:44px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
  .athlete-name{font-weight:700;font-size:15px}
  .athlete-discipline{color:#6b7280;margin-top:4px;font-size:13px}
  .athlete-card hr{margin:10px 0;border:0;border-top:1px solid #e4e7ec}
  .athlete-stats{display:flex;justify-content:space-between;gap:10px}
  .stat-label{color:#6b7280;font-size:13px}
  .stat-value{font-weight:700;margin-top:4px;font-size:15px}

  .recent-evals{margin-top:18px;background:#fff;border-radius:10px;padding:14px 16px;border:1px solid #e8ebf0;box-shadow:0 6px 14px rgba(15,23,36,0.04)}
  .recent-evals h4{margin:0 0 12px}
  .eval-list{display:flex;flex-direction:column;gap:10px}
  .eval-item{display:flex;align-items:center;justify-content:space-between;background:#f7f8fb;padding:12px 14px;border-radius:12px;border:1px solid #eef1f5}
  .eval-left{display:flex;align-items:center;gap:12px}
  .eval-avatar{width:44px;height:44px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
  .eval-name{font-weight:700}
  .eval-meta{color:#6b7280;font-size:13px;margin-top:2px}
  .eval-score{text-align:right}
  .eval-score .value{font-weight:700}
  .eval-score .label{color:#6b7280;font-size:13px}

  :global(canvas){width:100% !important;height:160px !important}

  @media (max-width:900px){
    .container{padding:0 16px}
    .grid-top{grid-template-columns:1fr 1fr}
    .grid-bottom{grid-template-columns:1fr}
    .athlete-grid{grid-template-columns:1fr}
  }

  @media (max-width:700px){
    .container{padding:0 12px}
    .page-header h1{font-size:22px}
    .athlete-grid{grid-template-columns:1fr}
  }

  @media (max-width:800px){
    .eval-item{padding:12px}
    .eval-avatar{width:40px;height:40px}
  }
</style>
