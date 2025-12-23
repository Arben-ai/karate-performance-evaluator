<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  export let data;

  const collator = new Intl.Collator('de', { sensitivity: 'base', ignorePunctuation: true });
  const normalize = (v) => (v || '').toString().trim();
  const displayName = (ath) => normalize(ath?.athlete || ath?.name);
  const dedupeById = (list = []) => {
    const map = new Map();
    list.forEach((ath) => {
      const key = ath?._id || ath?.id || displayName(ath);
      if (!key) return;
      if (!map.has(key)) map.set(key, ath);
    });
    return Array.from(map.values());
  };

  let urlAthleteId = '';
  let urlDiscipline = '';
  let athleteSearch = '';
  let selectedAthlete = '';
  let selectedDiscipline = '';
  let comment = '';
  let lastSaved = '';
  let toast = '';
  let toastTimer;
  let dropdownOpen = false;
  let dropdownEl;
  let coachName = 'Daniel';
  let animating = false;
  let animationFrame;

  const disciplines = ['Kata', 'Kumite'];

  $: coachName = data?.coachName || coachName;

  const formatCoachName = (value) => {
    const raw = (value || '').toString().trim();
    if (!raw) return 'Coach Daniel';
    return raw.toLowerCase().startsWith('coach ') ? raw : `Coach ${raw}`;
  };

  $: urlAthleteId = $page.url.searchParams.get('athlete') || '';
  $: urlDiscipline = $page.url.searchParams.get('discipline') || '';

  let criteria = [
    { id: 'praezision', label: 'Präzision', desc: 'Genauigkeit der Techniken', value: 75 },
    { id: 'technik', label: 'Technik', desc: 'Korrekte Ausführung', value: 75 },
    { id: 'geschwindigkeit', label: 'Geschwindigkeit', desc: 'Tempo und Dynamik', value: 75 },
    { id: 'fokus', label: 'Fokus', desc: 'Konzentration und Kime', value: 75 },
    { id: 'ausdruck', label: 'Ausdruck', desc: 'Gesamteindruck und Präsentation', value: 75 }
  ];

  const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });

  let allAthletes = (data?.athletes || []).slice();

  onMount(async () => {
    try {
      const res = await fetch('/api/athletes');
      if (!res.ok) return;
      const fresh = await res.json();
      allAthletes = dedupeById([...(fresh || []), ...allAthletes]);
    } catch (e) {
      console.warn('Athletes fetch failed', e);
    }
  });

  $: sortedAthletes = allAthletes
    .slice()
    .sort((a, b) => collator.compare(displayName(a), displayName(b)));
  $: filteredAthletes = sortedAthletes.filter((ath) => {
    const term = athleteSearch.trim().toLowerCase();
    if (!term) return true;
    const name = displayName(ath).toLowerCase();
    const discipline = normalize(ath?.discipline).toLowerCase();
    return name.includes(term) || discipline.includes(term);
  });
  $: groupedAthletes = (() => {
    const grouped = new Map();
    filteredAthletes.forEach((ath) => {
      const key = normalize(ath?.coach) || '-';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(ath);
    });
    return Array.from(grouped.entries())
      .sort((a, b) => collator.compare(a[0], b[0]))
      .map(([coachKey, list]) => {
        const coachName = list.find((a) => a?.coach)?.coach || coachKey || '-';
        return {
          coachKey,
          coachName,
          athletes: list.slice().sort((a, b) => collator.compare(displayName(a), displayName(b)))
        };
      });
  })();

  const getAthleteName = (id) => {
    const hit = sortedAthletes.find((a) => (a?._id || a.id)?.toString() === (id || '').toString());
    return displayName(hit) || id || '-';
  };
  const getDisciplineName = (d) => d || '-';

  $: if (!selectedDiscipline && urlDiscipline && disciplines.includes(urlDiscipline)) {
    selectedDiscipline = urlDiscipline;
  }

  function tryApplyUrlAthlete() {
    if (!urlAthleteId || selectedAthlete) return;
    const match = sortedAthletes.find((a) => (a?._id || a.id)?.toString() === urlAthleteId);
    if (match) {
      selectedAthlete = match._id || match.id;
      athleteSearch = displayName(match);
      dropdownOpen = false;
    }
  }

  $: tryApplyUrlAthlete();

  function closeOnOutsideClick(event) {
    if (!dropdownEl) return;
    if (!dropdownEl.contains(event.target)) {
      dropdownOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  });

  const clampScore = (v) => {
    const num = Number(v);
    if (Number.isNaN(num)) return 0;
    return Math.min(100, Math.max(0, Math.round(num)));
  };

  const setValue = (id, v) => {
    if (animating && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animating = false;
    }
    const next = clampScore(v);
    criteria = criteria.map((c) => (c.id === id ? { ...c, value: next } : c));
  };

  $: average = Math.round(criteria.reduce((sum, c) => sum + c.value, 0) / criteria.length);

  function formatDate(d = new Date()) {
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function badgeFor(score) {
    if (score >= 80) return { badge: 'Sehr gut', tone: 'green' };
    if (score >= 60) return { badge: 'Gut', tone: 'blue' };
    if (score >= 40) return { badge: 'Genügend', tone: 'yellow' };
    return { badge: 'Ungenügend', tone: 'red' };
  }

  async function saveEvaluation() {
    if (!selectedAthlete || !selectedDiscipline) return;
    const { badge, tone } = badgeFor(average);
    const entry = {
      id: `${Date.now()}`,
      name: `${getAthleteName(selectedAthlete)} - ${selectedDiscipline}`,
      athlete: getAthleteName(selectedAthlete),
      discipline: selectedDiscipline,
      coach: formatCoachName(coachName),
      date: formatDate(new Date()),
      text: comment || 'Neue Bewertung erfasst.',
      score: average,
      badge,
      badgeTone: tone,
      details: criteria.map((c) => ({ label: c.label, value: c.value })),
      comment: comment || 'Neue Bewertung erfasst.'
    };
    await evaluations.addEvaluation(entry);
    comment = '';
    lastSaved = `Bewertung gespeichert für ${entry.athlete} (${entry.discipline})`;
    showToast(`Bewertung für ${entry.athlete} gespeichert`);
    selectedAthlete = '';
    selectedDiscipline = '';
    athleteSearch = '';
  }

  function showToast(message) {
    toast = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast = '';
    }, 2500);
  }

  function startCriteriaAnimation() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = criteria.map((c) => c.value);
    const duration = 520;
    const start = window.performance?.now?.() || Date.now();
    animating = true;
    criteria = criteria.map((c) => ({ ...c, value: 0 }));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      criteria = criteria.map((c, idx) => ({
        ...c,
        value: Math.round(targets[idx] * eased)
      }));
      if (t < 1 && animating) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animating = false;
      }
    };
    animationFrame = requestAnimationFrame(step);
  }

  onMount(() => {
    startCriteriaAnimation();
  });
</script>

<div class="app-shell">
  <NavBar active="bewertung" />

  {#if toast}
    <div class="toast">{toast}</div>
  {/if}

  <main class="page container">
    <header class="page-header">
      <h1>Neue Bewertung</h1>
      <p class="muted">Erfassen Sie eine Performance-Bewertung für einen Athleten</p>
    </header>

    <div class="content-grid">
      <div class="left-col">
        <section class="card section fly-in">
          <h3>Athlet &amp; Disziplin auswählen</h3>
          <div class="select-row">
            <div class="field">
              <label for="athlete">Athlet</label>
              <div class="search-select" bind:this={dropdownEl}>
                <input
                  id="athlete-input"
                  type="search"
                  placeholder="Athlet auswählen oder tippen..."
                  bind:value={athleteSearch}
                  class:filled={selectedAthlete}
                  on:focus={() => (dropdownOpen = true)}
                  on:input={() => (dropdownOpen = true)}
                />
                {#if selectedAthlete}
                  <div class="selected-hint">Ausgewählt: {getAthleteName(selectedAthlete)}</div>
                {/if}
                {#if dropdownOpen}
                  <div class="dropdown-panel">
                    <ul role="listbox">
                      {#if groupedAthletes.length === 0}
                        <li class="empty">Kein Athlet gefunden</li>
                      {:else}
                        {#each groupedAthletes as group (group.coachKey)}
                          <li class="coach">Coach {group.coachName}</li>
                          {#each group.athletes as a (a._id ?? a.id ?? a.athlete)}
                            <li>
                              <button
                                type="button"
                                on:click={() => {
                                  selectedAthlete = a._id || a.id;
                                  athleteSearch = displayName(a);
                                  dropdownOpen = false;
                                }}
                              >
                                {displayName(a)}
                              </button>
                            </li>
                          {/each}
                        {/each}
                      {/if}
                    </ul>
                  </div>
                {/if}
              </div>
            </div>
            <div class="field">
              <label for="discipline">Disziplin</label>
              <select id="discipline" bind:value={selectedDiscipline} class:filled={selectedDiscipline}>
                <option value="" disabled selected hidden>Disziplin auswählen</option>
                {#each disciplines as d}
                  <option value={d}>{d}</option>
                {/each}
              </select>
            </div>
          </div>
        </section>

        <section class="card section">
          <h3>Bewertungskriterien</h3>
          {#each criteria as c}
            <div class="criterion">
              <div class="crit-title">{c.label}</div>
              <div class="crit-sub">{c.desc}</div>
              <div class="slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  bind:value={c.value}
                  style={`--val:${c.value};`}
                  on:input={(e) => setValue(c.id, e.target.value)}
                />
                <input
                  class="pill pill-input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={c.value}
                  on:input={(e) => setValue(c.id, e.target.value)}
                  aria-label={`Wert für ${c.label}`}
                />
              </div>
              <div class="scale">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          {/each}
        </section>

        <section class="card section">
          <h3>Coach Kommentar</h3>
          <textarea
            class="comment-box"
            rows="6"
            placeholder="Fügen Sie hier Ihre Anmerkungen und Verbesserungsvorschläge hinzu..."
            bind:value={comment}
          ></textarea>
        </section>

        <button class="save-btn" type="button" on:click={saveEvaluation}>
          Bewertung speichern
        </button>

        {#if lastSaved}
          <div class="save-hint">{lastSaved}</div>
        {/if}
      </div>

      <div class="right-col">
        <aside class="card summary fly-in-right">
          <h3>Zusammenfassung</h3>
          <div class="summary-row">
            <div class="label">Athlet</div>
            <div class="value">{selectedAthlete ? getAthleteName(selectedAthlete) : "-"}</div>
          </div>
          <div class="summary-row">
            <div class="label">Disziplin</div>
            <div class="value">{selectedDiscipline ? getDisciplineName(selectedDiscipline) : "-"}</div>
          </div>

          <hr />

          <div class="summary-row">
            <div class="label">Durchschnittliche Bewertung</div>
            <div class="value strong">{average}</div>
          </div>
          <div class="progress">
            <div class="progress-bar" style={`width:${average}%`}></div>
          </div>

          <hr />
          <div class="summary-list">
            <div class="label">Einzelbewertungen</div>
            {#each criteria as c}
              <div class="summary-row">
                <div class="label">{c.label}</div>
                <div class="value">{c.value}</div>
              </div>
            {/each}
          </div>

          <hr />
          <div class="summary-row">
            <div class="label">Datum</div>
            <div class="value">{today}</div>
          </div>
        </aside>

        <a class="btn-link view-link fly-in-link" style="--delay: 0" href="/coach/feedback">Bewertungen ansehen</a>
        <a class="btn-link delete-link fly-in-link" style="--delay: 1" href="/coach/feedback">Bewertungen löschen</a>
      </div>
    </div>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:0 auto;padding:8px 20px}
  .page-header h1{margin:0 0 6px;font-size:28px;font-weight:700}
  .muted{margin:0;color:#6b7280;font-size:14px}
  .btn-link{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;color:#111;font-weight:600;text-decoration:none;box-shadow:0 4px 10px rgba(0,0,0,0.04)}
  .btn-link.fly-in-link{
    opacity:0;
    transform:translateY(18px);
    animation:linkFlyIn 520ms ease forwards;
    animation-delay:calc(var(--delay, 0) * 90ms + 260ms);
  }

  .content-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-top:18px}
  .left-col{display:flex;flex-direction:column;gap:16px}
  .right-col{display:flex;flex-direction:column;gap:12px;align-self:stretch}
  .right-col > *{width:100%}

  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 8px 18px rgba(15,23,36,0.05)}
  .section{padding:16px 18px}
  .section h3{margin:0 0 12px;font-size:18px}
  .section.fly-in{
    opacity:0;
    transform:translateX(-22px);
    animation:sectionFlyIn 560ms ease forwards;
    animation-delay:120ms;
  }

  .select-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .field label{display:block;font-weight:600;font-size:13px;margin-bottom:6px;color:#111}
  .field select{
    width:100%;
    padding:12px 14px;
    border-radius:10px;
    border:1px solid #e5e7eb;
    background:#fff;
    font-size:16px;
    color:#9ca3af;
    box-shadow:0 4px 10px rgba(0,0,0,0.04);
    appearance:none;
    font-weight:500;
    background-image: linear-gradient(45deg, transparent 50%, #9ca3af 50%),
      linear-gradient(135deg, #9ca3af 50%, transparent 50%);
    background-position: calc(100% - 20px) calc(50% - 3px), calc(100% - 15px) calc(50% - 3px);
    background-size: 8px 8px, 8px 8px;
    background-repeat: no-repeat;
  }
  .field select option{color:#111;font-weight:500;}
  .field select.filled{color:#111;font-weight:500;}
  .field .search{display:none}
  .search-select{position:relative}
  .search-select input{
    width:100%;
    padding:12px 14px;
    border-radius:10px;
    border:1px solid #e5e7eb;
    background:#fff;
    font-size:16px;
    color:#9ca3af;
    box-shadow:0 4px 10px rgba(0,0,0,0.04);
  }
  .search-select input.filled{color:#111;}
  .search-select input::placeholder{color:#9ca3af}
  .selected-hint{margin-top:6px;font-size:13px;color:#6b7280}
  .dropdown-panel{
    position:absolute;
    top:calc(100% + 6px);
    left:0;
    right:0;
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:12px;
    box-shadow:0 12px 28px rgba(15,23,36,0.12);
    z-index:20;
    max-height:260px;
    overflow:hidden;
  }
  .dropdown-panel ul{
    list-style:none;
    margin:0;
    padding:6px 0;
    max-height:220px;
    overflow:auto;
  }
  .dropdown-panel li{padding:0}
  .dropdown-panel li button{
    width:100%;
    text-align:left;
    border:0;
    background:#fff;
    padding:12px 14px;
    font-size:16px;
    cursor:pointer;
  }
  .dropdown-panel li button:hover{background:#f5f7fb}
  .dropdown-panel li.coach{
    font-weight:700;
    padding:10px 12px 6px;
    color:#111;
    background:#f1f5f9;
  }
  .dropdown-panel li.empty{
    padding:12px;
    color:#6b7280;
    font-size:14px;
  }

  .criterion{padding:10px 0;border-bottom:1px solid #eef1f5}
  .criterion:last-child{border-bottom:0}
  .crit-title{font-weight:700;font-size:14px;margin-bottom:4px}
  .crit-sub{color:#6b7280;font-size:13px;margin-bottom:10px}
  .criterion{--pill-width:70px;--pill-gap:12px;}
  .slider-row{
    display:grid;
    grid-template-columns:1fr auto;
    column-gap:var(--pill-gap);
    align-items:center;
    position:relative;
  }
  .slider-row input[type="range"]{
    width:100%;
    appearance:none;
    height:10px;
    border-radius:999px;
    outline:none;
    background:linear-gradient(90deg,#e11d2f 0%,#e11d2f calc(var(--val,50)*1%),#e6e7eb calc(var(--val,50)*1%),#e6e7eb 100%);
  }
  .slider-row input[type="range"]::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #111;box-shadow:0 1px 4px rgba(0,0,0,0.25);margin-top:-3px}
  .slider-row input[type="range"]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #111;box-shadow:0 1px 4px rgba(0,0,0,0.25)}
  .pill{width:var(--pill-width);min-height:44px;display:inline-flex;align-items:center;justify-content:center;background:#e11d2f;color:#fff;border-radius:10px;font-weight:700;font-size:16px;border:0;box-shadow:none}
  .pill-input{
    text-align:center;
    appearance:textfield;
    -moz-appearance:textfield;
    background:#e11d2f;
    color:#fff;
    padding:0 8px;
  }
  .pill-input::-webkit-outer-spin-button,
  .pill-input::-webkit-inner-spin-button{
    -webkit-appearance:none;
    margin:0;
  }
  .scale{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    font-size:12px;
    color:#6b7280;
    margin-top:6px;
    width:calc(100% - (var(--pill-width) + var(--pill-gap)));
    max-width:calc(100% - (var(--pill-width) + var(--pill-gap)));
    transform:translateX(-6px);
  }
  .scale span:nth-child(1){text-align:left}
  .scale span:nth-child(2){text-align:center}
  .scale span:nth-child(3){text-align:right}

  .summary{padding:16px 18px}
  .summary{max-height:fit-content;align-self:start}
  .summary h3{margin:0 0 10px}
  .summary.fly-in-right{
    opacity:0;
    transform:translateX(22px);
    animation:summaryFlyIn 560ms ease forwards;
    animation-delay:200ms;
  }
  .summary-row{display:flex;justify-content:space-between;align-items:center;font-size:14px;margin:6px 0}
  .summary-row .label{color:#6b7280}
  .summary-row .value{color:#111;font-weight:600}
  .summary-row .value.strong{font-weight:700}
  .summary hr{border:0;border-top:1px solid #eef1f5;margin:12px 0}
  .progress{height:10px;background:#e6e7eb;border-radius:999px;overflow:hidden;margin:6px 0 10px}
  .progress-bar{height:100%;background:#e11d2f;border-radius:999px}
  .summary-list .summary-row{margin:4px 0}
  .view-link,
  .delete-link{justify-content:center;font-size:16px;font-weight:700;width:100%;text-align:center}
  .view-link{background:#0f1724;color:#fff;border-color:#0f1724}
  .view-link:hover{background:#0c1220;color:#fff}

  .save-btn{margin-top:8px;width:100%;padding:14px;border-radius:10px;border:none;background:#e11d2f;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 10px 26px rgba(225,29,47,0.15)}
  .save-btn:hover{background:#c9152a}
  .save-ico{font-size:16px}
  .save-hint{margin-top:8px;font-size:14px;color:#111;font-weight:600}

  .comment-box{
    width:100%;
    max-width:100%;
    min-height:140px;
    padding:12px 14px;
    border-radius:10px;
    border:1px solid #e5e7eb;
    background:#fff;
    font-size:15px;
    color:#111;
    line-height:1.5;
    resize:vertical;
    box-shadow:0 4px 10px rgba(0,0,0,0.04);
    box-sizing:border-box;
  }
  .comment-box::placeholder{color:#9ca3af}
  .toast{
    position:fixed;
    top:18px;
    right:18px;
    background:#0f1724;
    color:#fff;
    padding:10px 14px;
    border-radius:10px;
    box-shadow:0 8px 16px rgba(0,0,0,0.18);
    font-weight:700;
    font-size:14px;
    z-index:20;
  }

  @keyframes sectionFlyIn{
    from{opacity:0;transform:translateX(-22px)}
    to{opacity:1;transform:translateX(0)}
  }

  @keyframes summaryFlyIn{
    from{opacity:0;transform:translateX(22px)}
    to{opacity:1;transform:translateX(0)}
  }

  @keyframes linkFlyIn{
    from{opacity:0;transform:translateY(18px)}
    to{opacity:1;transform:translateY(0)}
  }

  @media (prefers-reduced-motion: reduce){
    .section.fly-in,
    .summary.fly-in-right,
    .btn-link.fly-in-link{animation:none;opacity:1;transform:none}
  }

  @media (max-width:1000px){
    .content-grid{grid-template-columns:1fr}
  }

  @media (max-width:640px){
    .select-row{grid-template-columns:1fr}
  }
</style>
