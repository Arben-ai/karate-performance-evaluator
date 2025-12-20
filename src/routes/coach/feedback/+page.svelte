<script>
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  const stats = [
    { key: 'total', label: 'Gesamt Feedbacks' },
    { key: 'excellent', label: 'Sehr gute Bewertungen' },
    { key: 'recent', label: 'Diese Woche', sub: 'Letzte Aktivitätttät' }
  ];

  let expandedId = null;
  let confirmId = null;
  let searchTerm = '';
  let filterBadge = 'alle';
  let filterDiscipline = 'alle';
  let confirmAll = false;
  let confirmAllInput = '';

  const badgeOptions = ['Sehr gut', 'Gut', 'Genügend', 'Ungenügend'];
  const normalize = (v) => (v || '').toString().toLowerCase().trim();
  const parseDate = (v) => {
    if (!v) return 0;
    const parts = v.split('.');
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      const date = new Date(y, m - 1, d);
      if (!Number.isNaN(date.getTime())) return date.getTime();
    }
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  };

  $: feedbacks = $evaluations || [];
  $: disciplineOptions = Array.from(new Set(feedbacks.map((f) => f?.discipline).filter(Boolean)));
  $: sortedFeedbacks = feedbacks.slice().sort((a, b) => parseDate(b?.date) - parseDate(a?.date));
  $: filteredFeedbacks = sortedFeedbacks.filter((f) => {
    const term = normalize(searchTerm);
    const badgeLabel = normalize(badgeForScore(f.score, f.badge, f.badgeTone).label);
    const matchesSearch = term
      ? [
          normalize(f.name),
          normalize(f.athlete),
          normalize(f.coach),
          normalize(f.discipline),
          normalize(f.text),
          normalize(f.comment),
          badgeLabel
        ].some((field) => field.includes(term))
      : true;
    const matchesBadge = filterBadge === 'alle' ? true : badgeLabel === normalize(filterBadge);
    const matchesDiscipline =
      filterDiscipline === 'alle' ? true : normalize(f.discipline) === normalize(filterDiscipline);
    return matchesSearch && matchesBadge && matchesDiscipline;
  });
  $: totalCount = feedbacks.length;
  $: visibleCount = filteredFeedbacks.length;
  $: excellentCount = filteredFeedbacks.filter(
    (f) => badgeForScore(f.score, f.badge, f.badgeTone).label === 'Sehr gut'
  ).length;
  $: lastDate = filteredFeedbacks[0]?.date || '-';
  $: statValues = { total: visibleCount, excellent: excellentCount, recent: lastDate };

  function badgeForScore(score, fallbackBadge, fallbackTone) {
    const s = Number(score) || 0;
    if (s >= 80) return { label: 'Sehr gut', tone: 'green' };
    if (s >= 60) return { label: 'Gut', tone: 'blue' };
    if (s >= 40) return { label: 'Genügend', tone: 'yellow' };
    if (s >= 0) return { label: 'Ungenügend', tone: 'red' };
    return { label: fallbackBadge || 'Neu starten', tone: fallbackTone || 'gray' };
  }

  function requestDelete(id) {
    confirmId = id;
  }

  function cancelDelete() {
    confirmId = null;
    confirmAll = false;
    confirmAllInput = '';
  }

  async function deleteFeedback(id) {
    if (!id) return;
    await evaluations.removeEvaluation(id);
    if (expandedId === id) expandedId = null;
    if (confirmId === id) confirmId = null;
  }

  async function deleteAllFeedback() {
    if (confirmAllInput.trim().toLowerCase() !== 'löschen') return;
    await evaluations.removeAll();
    confirmAll = false;
    confirmAllInput = '';
    expandedId = null;
    confirmId = null;
  }

  function resetFilters() {
    searchTerm = '';
    filterBadge = 'alle';
    filterDiscipline = 'alle';
  }
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

    <section class="filter-bar card">
      <div class="filter-controls">
        <input
          type="search"
          placeholder="Suche nach Athlet, Coach oder Text"
          bind:value={searchTerm}
        />
        <select class="filter-select" bind:value={filterBadge} aria-label="Nach Bewertung filtern">
          <option value="alle">Alle Bewertungen</option>
          {#each badgeOptions as badge}
            <option value={badge}>{badge}</option>
          {/each}
        </select>
        <select class="filter-select" bind:value={filterDiscipline} aria-label="Nach Disziplin filtern">
          <option value="alle">Alle Disziplinen</option>
          {#each disciplineOptions as d}
            <option value={d}>{d}</option>
          {/each}
        </select>
        <button class="ghost-btn" type="button" on:click={resetFilters}>Filter zurücksetzen</button>
      </div>
      <div class="filter-meta">
        <div class="count-chip">{visibleCount} von {totalCount} Feedbacks</div>
        {#if visibleCount !== totalCount}
          <span class="muted small">Filter aktiv</span>
        {/if}
        <div class="bulk-actions">
          {#if confirmAll}
            <div class="confirm-row">
              <span class="muted small">Zum Bestätigen älöschen“ eingeben</span>
              <input
                class="confirm-input"
                placeholder="löschen"
                bind:value={confirmAllInput}
                aria-label="Löschbestätigung"
              />
              <button class="delete-btn" type="button" on:click={deleteAllFeedback} disabled={confirmAllInput.trim().toLowerCase() !== 'löschen'}>
                Alle löschen
              </button>
              <button class="ghost-btn small" type="button" on:click={cancelDelete}>Abbrechen</button>
            </div>
          {:else}
            <button class="delete-btn" type="button" on:click={() => (confirmAll = true)}>Alle löschen</button>
          {/if}
        </div>
      </div>
    </section>

    <section class="feedback-list">
      {#if filteredFeedbacks.length === 0}
        <div class="empty card">
          <h3>Keine Bewertungen gefunden</h3>
          <p>Keine Treffer für die aktuelle Suche oder Filter.</p>
          <button class="ghost-btn" type="button" on:click={resetFilters}>Filter zurücksetzen</button>
        </div>
      {:else}
        {#each filteredFeedbacks as f}
          <article class="feedback card">
            <button
              class="feedback-head"
              type="button"
              on:click={() => (expandedId = expandedId === f.id ? null : f.id)}
              aria-expanded={expandedId === f.id}
            >
              <div class="feedback-main">
                <div class="avatar">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
                  >
                    <circle cx="12" cy="9" r="3.2"></circle>
                    <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0"></path>
                    <path d="M6.5 18.5h11"></path>
                  </svg>
                </div>
                <div class="feedback-body">
                  <div class="feedback-title">{f.name}</div>
                  <div class="meta">{f.coach} - {f.date}</div>
                  <div class="feedback-text">{f.text}</div>
                </div>
              </div>
              <div class="feedback-meta">
                {#if badgeForScore(f.score, f.badge, f.badgeTone)}
                  <span class={`badge ${badgeForScore(f.score, f.badge, f.badgeTone).tone}`}>
                    {badgeForScore(f.score, f.badge, f.badgeTone).label}
                  </span>
                {/if}
                <div class="score">{f.score}</div>
                <div class={`chevron ${expandedId === f.id ? 'open' : ''}`}>&#709;</div>
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
                  <div class="comment-label">Kommentar</div>
                  <div class="comment-text">{f.comment}</div>
                </div>
                <div class="footer-meta">
                  <div class="footer-left">
                    Bewertet von: {f.coach}
                    <span class="date">{f.date}</span>
                  </div>
                  {#if confirmId === f.id}
                    <div class="delete-confirm">
                      <span>Soll die Bewertung gelöscht werden?</span>
                      <div class="confirm-actions">
                        <button class="delete-btn" type="button" on:click={() => deleteFeedback(f.id)}>
                          Löschen
                        </button>
                        <button class="cancel-btn" type="button" on:click={cancelDelete}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  {:else}
                    <button class="delete-btn" type="button" on:click={() => requestDelete(f.id)}>
                      Bewertung löschen
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
          </article>
        {/each}
      {/if}
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

  .filter-bar{margin-top:14px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .filter-controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .filter-controls input,.filter-controls select{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;font-size:14px;min-width:200px}
  .filter-controls input{flex:1;min-width:260px}
  .filter-controls select{min-width:170px}
  .filter-select{
    padding:12px 14px;
    border-radius:10px;
    border:1px solid #e5e7eb;
    background:#fff;
    font-size:16px;
    color:#111;
    box-shadow:0 4px 10px rgba(0,0,0,0.04);
    appearance:none;
    background-image: linear-gradient(45deg, transparent 50%, #9ca3af 50%),
      linear-gradient(135deg, #9ca3af 50%, transparent 50%);
    background-position: calc(100% - 20px) calc(50% - 3px), calc(100% - 15px) calc(50% - 3px);
    background-size: 8px 8px, 8px 8px;
    background-repeat: no-repeat;
  }
  .ghost-btn{border:1px solid #e5e7eb;color:#111;background:#fff;padding:9px 12px;border-radius:10px;font-weight:700;cursor:pointer;transition:all .15s ease}
  .ghost-btn:hover{background:#f3f4f6}
  .filter-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
  .count-chip{background:#eef1f5;padding:6px 10px;border-radius:999px;color:#111;font-weight:700;font-size:13px;border:1px solid #e2e6ec}
  .small{font-size:13px}
  .bulk-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .confirm-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .confirm-input{padding:8px 10px;border-radius:10px;border:1px solid #e5e7eb;font-size:14px;min-width:140px}

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
  .badge.red{background:#fef2f2;color:#b91c1c;border-color:#fecdd3}
  .badge.yellow{background:#fefce8;color:#854d0e;border-color:#fef08a}
  .badge.gray{background:#f3f4f6;color:#374151;border-color:#e5e7eb}
  .score{font-weight:700;color:#111;font-size:16px}
  .chevron{color:#6b7280;font-size:16px;transform:rotate(0deg);transition:transform .15s ease}
  .chevron.open{transform:rotate(180deg)}

  .feedback-detail{border-top:1px solid #eef1f5;padding:12px 0 6px;display:flex;flex-direction:column;gap:14px}
  .detail-title{font-weight:700;font-size:14px}
  .pill-row{display:flex;gap:28px;flex-wrap:wrap;justify-content:flex-start;align-items:flex-start;padding:6px 0}
  .pill-score{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-width:100px;gap:8px}
  .pill-round{width:82px;height:82px;border-radius:50%;background:#e11d2f;color:#fff;font-weight:800;font-size:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px rgba(225,29,47,0.18)}
  .pill-label{margin:0;font-weight:700;color:#111;font-size:14px;text-align:center}

  .comment-box{border:1px solid #eef1f5;background:#f7f8fb;border-radius:14px;padding:14px 16px;max-width:100%;margin:6px 0}
  .comment-label{color:#6b7280;font-size:13px;margin-bottom:6px;display:flex;align-items:center;gap:6px;font-weight:700}
  .comment-text{color:#1f2937;font-size:15px;font-weight:600}
  .footer-meta{display:flex;justify-content:space-between;align-items:center;color:#6b7280;font-size:13px;padding:4px 0 0;gap:10px;flex-wrap:wrap}
  .footer-meta .date{color:#111}
  .footer-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .delete-btn{border:1px solid #e11d2f;color:#e11d2f;background:#fff;padding:8px 12px;border-radius:10px;font-weight:700;cursor:pointer;transition:all .15s ease}
  .delete-btn:hover{background:#ffe5e9;color:#b91c1c;border-color:#b91c1c}
  .delete-confirm{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
  .confirm-actions{display:flex;gap:8px;flex-wrap:wrap}
  .cancel-btn{border:1px solid #e5e7eb;color:#374151;background:#fff;padding:8px 12px;border-radius:10px;font-weight:700;cursor:pointer;transition:all .15s ease}
  .cancel-btn:hover{background:#f3f4f6}
  .empty{text-align:center;padding:26px}
  .empty p{margin:6px 0 12px;color:#6b7280;font-size:14px}

  @media (max-width:900px){
    .stat-grid{grid-template-columns:1fr}
    .feedback-head{flex-direction:column;align-items:flex-start}
    .feedback-meta{width:100%;justify-content:flex-start}
    .filter-controls{width:100%}
    .filter-controls input,.filter-controls select{width:100%;min-width:0}
    .filter-bar{align-items:flex-start}
  }
</style>









