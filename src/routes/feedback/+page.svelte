<script>
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  const stats = [
    { key: 'total', label: 'Gesamt Feedbacks' },
    { key: 'excellent', label: 'Exzellente Bewertungen' },
    { key: 'recent', label: 'Diese Woche', sub: 'Letzte Aktivität' }
  ];

  let expandedId = null;
  $: feedbacks = $evaluations;
  $: totalCount = feedbacks.length;
  $: excellentCount = feedbacks.filter((f) => f.badge === 'Exzellent').length;
  $: lastDate = feedbacks[0]?.date || '—';
  $: statValues = { total: totalCount, excellent: excellentCount, recent: lastDate };
</script>

<div class="app-shell">
  <NavBar active="feedback" />

  <main class="page container">
    <header class="page-header">
      <h1>Feedback &amp; Bewertungen</h1>
      <p class="muted">Übersicht aller abgegebenen Bewertungen</p>
    </header>

    <section class="stat-grid">
      {#each stats as s}
        <div class="stat card">
          <div class="stat-value">{statValues[s.key]}</div>
          <div class="stat-label">{s.label}</div>
          {#if s.sub}<div class="stat-sub">{s.sub}</div>{/if}
        </div>
      {/each}
    </section>

    <section class="feedback-list">
      {#each feedbacks as f}
        <article class="feedback card">
          <button class="feedback-head" type="button" on:click={() => expandedId = expandedId === f.id ? null : f.id} aria-expanded={expandedId === f.id}>
            <div class="feedback-main">
              <div class="avatar">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="9" r="3.2"></circle>
                  <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0"></path>
                  <path d="M6.5 18.5h11"></path>
                </svg>
              </div>
              <div class="feedback-body">
                <div class="feedback-title">{f.name}</div>
                <div class="meta">{f.coach} • {f.date}</div>
                <div class="feedback-text">{f.text}</div>
              </div>
            </div>
            <div class="feedback-meta">
              <span class={`badge ${f.badgeTone}`}>{f.badge}</span>
              <div class="score">{f.score}</div>
              <div class={`chevron ${expandedId === f.id ? 'open' : ''}`}>⌄</div>
            </div>
          </button>

          {#if expandedId === f.id}
            <div class="feedback-detail">
              <div class="detail-title">Detailbewertung</div>
              <div class="pill-row">
                {#each f.details as d}
                  <div class="pill-score">
                    <div class="pill-round">{d.value}</div>
                    <div class="pill-label">{d.label}</div>
                  </div>
                {/each}
              </div>
              <div class="comment-box">
                <div class="comment-label">🗨 Kommentar</div>
                <div class="comment-text">{f.comment}</div>
              </div>
              <div class="footer-meta">
                Bewertet von: {f.coach}
                <span class="date">{f.date}</span>
              </div>
            </div>
          {/if}
        </article>
      {/each}
    </section>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-size:26px;font-weight:700}
  .page-header .muted{margin:6px 0 0;color:#6b7280;font-size:14px}

  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}

  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}
  .stat{padding:14px}
  .stat-value{font-size:22px;font-weight:700;color:#0f1724}
  .stat-label{margin-top:4px;color:#6b7280;font-size:13px}
  .stat-sub{color:#9ca3af;font-size:12px;margin-top:2px}

  .feedback-list{margin-top:16px;display:flex;flex-direction:column;gap:14px}
  .feedback{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
  .feedback-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;background:transparent;border:0;width:100%;text-align:left;padding:0;cursor:pointer}
  .feedback-main{display:flex;gap:12px;align-items:flex-start}
  .avatar{width:40px;height:40px;border-radius:50%;background:#e11d2f;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .feedback-body{display:flex;flex-direction:column;gap:4px}
  .feedback-title{font-weight:700;font-size:15px;color:#111}
  .meta{color:#6b7280;font-size:13px}
  .feedback-text{color:#1f2937;font-size:14px;max-width:960px}

  .feedback-meta{display:flex;align-items:center;gap:12px}
  .badge{padding:6px 10px;border-radius:10px;font-weight:700;font-size:12px;border:1px solid transparent}
  .badge.green{background:#ecfdf3;color:#065f46;border-color:#bbf7d0}
  .badge.blue{background:#eef2ff;color:#4338ca;border-color:#c7d2fe}
  .score{font-weight:700;color:#111;font-size:16px}
  .chevron{color:#6b7280;font-size:16px;transform:rotate(0deg);transition:transform .15s ease}
  .chevron.open{transform:rotate(180deg)}

  .feedback-detail{border-top:1px solid #eef1f5;padding:12px 0 6px;display:flex;flex-direction:column;gap:14px}
  .detail-title{font-weight:700;font-size:14px}
  .pill-row{display:flex;gap:26px;flex-wrap:wrap;justify-content:flex-start}
  .pill-score{text-align:center;min-width:96px}
  .pill-round{width:60px;height:60px;border-radius:50%;background:#e11d2f;color:#fff;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(225,29,47,0.14)}
  .pill-label{margin-top:6px;font-weight:600;color:#111;font-size:13px}

  .comment-box{border:1px solid #eef1f5;background:#f7f8fb;border-radius:10px;padding:12px 14px;max-width:100%;margin:0}
  .comment-label{color:#6b7280;font-size:13px;margin-bottom:4px;display:flex;align-items:center;gap:6px}
  .comment-text{color:#1f2937;font-size:14px}
  .footer-meta{display:flex;justify-content:space-between;align-items:center;color:#6b7280;font-size:13px;padding:4px 0 0}
  .footer-meta .date{color:#111}

  @media (max-width:900px){
    .stat-grid{grid-template-columns:1fr}
    .feedback-head{flex-direction:column;align-items:flex-start}
    .feedback-meta{width:100%;justify-content:flex-start}
  }
</style>
