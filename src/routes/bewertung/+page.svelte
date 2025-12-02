<script>
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  const athletes = [
    { id: 'sarah', name: 'Sarah Weber', discipline: 'Kata' },
    { id: 'marc', name: 'Marc Müller', discipline: 'Kumite' },
    { id: 'anna', name: 'Anna Schmidt', discipline: 'Kihon' },
    { id: 'david', name: 'David Klein', discipline: 'Kata' }
  ];

  const disciplines = ['Kata', 'Kumite', 'Kihon'];

  let selectedAthlete = 'Sarah Weber';
  let selectedDiscipline = 'Kata';
  let comment = '';

  let criteria = [
    { id: 'praezision', label: 'Präzision', desc: 'Genauigkeit der Techniken', value: 75 },
    { id: 'technik', label: 'Technik', desc: 'Korrekte Ausführung', value: 75 },
    { id: 'geschwindigkeit', label: 'Geschwindigkeit', desc: 'Tempo und Dynamik', value: 75 },
    { id: 'fokus', label: 'Fokus', desc: 'Konzentration und Kime', value: 75 },
    { id: 'ausdruck', label: 'Ausdruck', desc: 'Gesamteindruck und Präsentation', value: 75 }
  ];

  const today = '17.11.2025';

  const getAthleteName = (id) => athletes.find((a) => a.id === id)?.name || id || '—';
  const getDisciplineName = (d) => d || '—';

  const setValue = (id, v) => {
    criteria = criteria.map((c) => (c.id === id ? { ...c, value: Number(v) } : c));
  };

  $: average = Math.round(criteria.reduce((sum, c) => sum + c.value, 0) / criteria.length);

  function formatDate(d = new Date()) {
    return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function badgeFor(score) {
    if (score >= 90) return { badge: 'Exzellent', tone: 'green' };
    if (score >= 80) return { badge: 'Gut', tone: 'blue' };
    return { badge: 'OK', tone: 'blue' };
  }

  function saveEvaluation() {
    if (!selectedAthlete || !selectedDiscipline) return;
    const { badge, tone } = badgeFor(average);
    const entry = {
      id: `${Date.now()}`,
      name: `${getAthleteName(selectedAthlete)} – ${selectedDiscipline}`,
      athlete: getAthleteName(selectedAthlete),
      discipline: selectedDiscipline,
      coach: 'Coach Daniel',
      date: formatDate(new Date()),
      text: comment || 'Neue Bewertung erfasst.',
      score: average,
      badge,
      badgeTone: tone,
      details: criteria.map((c) => ({ label: c.label, value: c.value })),
      comment: comment || 'Neue Bewertung erfasst.'
    };
    evaluations.addEvaluation(entry);
    comment = '';
  }
</script>

<div class="app-shell">
  <NavBar active="bewertung" />

  <main class="page container">
    <header class="page-header">
      <h1>Neue Bewertung</h1>
      <p class="muted">Erfassen Sie eine Performance-Bewertung für einen Athleten</p>
    </header>

    <div class="content-grid">
      <div class="left-col">
        <section class="card section">
          <h3>Athlet &amp; Disziplin auswählen</h3>
          <div class="select-row">
            <div class="field">
              <label for="athlete">Athlet</label>
              <select id="athlete" bind:value={selectedAthlete}>
                <option value="" disabled selected hidden>Athlet wählen...</option>
                {#each athletes as a}
                  <option value={a.id}>{a.name}</option>
                {/each}
              </select>
            </div>
            <div class="field">
              <label for="discipline">Disziplin</label>
              <select id="discipline" bind:value={selectedDiscipline}>
                <option value="" disabled selected hidden>Disziplin wählen...</option>
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
                  value={c.value}
                  on:input={(e) => setValue(c.id, e.target.value)}
                />
                <div class="pill">{c.value}</div>
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
            rows="4"
            placeholder="Fügen Sie hier Ihre Anmerkungen und Verbesserungsvorschläge hinzu..."
            bind:value={comment}
          ></textarea>
        </section>

        <button class="save-btn" type="button" on:click={saveEvaluation}>
          <span class="save-ico">📄</span>
          Bewertung speichern
        </button>
      </div>

      <aside class="card summary">
        <h3>Zusammenfassung</h3>
        <div class="summary-row">
          <div class="label">Athlet</div>
          <div class="value">{selectedAthlete ? getAthleteName(selectedAthlete) : '—'}</div>
        </div>
        <div class="summary-row">
          <div class="label">Disziplin</div>
          <div class="value">{selectedDiscipline ? getDisciplineName(selectedDiscipline) : '—'}</div>
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
    </div>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0 0 6px;font-size:28px;font-weight:700}
  .muted{margin:0;color:#6b7280;font-size:14px}

  .content-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-top:18px}
  .left-col{display:flex;flex-direction:column;gap:16px}

  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 8px 18px rgba(15,23,36,0.05)}
  .section{padding:16px 18px}
  .section h3{margin:0 0 12px;font-size:18px}

  .select-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .field label{display:block;font-weight:600;font-size:13px;margin-bottom:6px;color:#111}
  .field select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;background:#f7f8fb;color:#111}

  .criterion{padding:10px 0;border-bottom:1px solid #eef1f5}
  .criterion:last-child{border-bottom:0}
  .crit-title{font-weight:700;font-size:14px;margin-bottom:4px}
  .crit-sub{color:#6b7280;font-size:13px;margin-bottom:10px}
  .slider-row{display:flex;align-items:center;gap:12px}
  .slider-row input[type="range"]{flex:1;appearance:none;height:10px;border-radius:999px;background:#e6e7eb;outline:none}
  .slider-row input[type="range"]::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #111;box-shadow:0 1px 4px rgba(0,0,0,0.25);margin-top:-3px}
  .slider-row input[type="range"]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #111;box-shadow:0 1px 4px rgba(0,0,0,0.25)}
  .slider-row input[type="range"]::-webkit-slider-runnable-track{height:10px;border-radius:999px;background:linear-gradient(90deg,#0b0c18 0%,#0b0c18 calc(var(--val,75)*1%),#e6e7eb 0)}
  .pill{min-width:56px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;background:#e11d2f;color:#fff;border-radius:10px;font-weight:700;font-size:16px}
  .scale{display:flex;justify-content:space-between;font-size:12px;color:#6b7280;margin-top:6px}

  .summary{padding:16px 18px}
  .summary h3{margin:0 0 10px}
  .summary-row{display:flex;justify-content:space-between;align-items:center;font-size:14px;margin:6px 0}
  .summary-row .label{color:#6b7280}
  .summary-row .value{color:#111;font-weight:600}
  .summary-row .value.strong{font-weight:700}
  .summary hr{border:0;border-top:1px solid #eef1f5;margin:12px 0}
  .progress{height:10px;background:#e6e7eb;border-radius:999px;overflow:hidden;margin:6px 0 10px}
  .progress-bar{height:100%;background:#e11d2f;border-radius:999px}
  .summary-list .summary-row{margin:4px 0}

  .athletes-section{margin-top:20px;background:#fff;border-radius:10px;padding:14px 18px 18px;border:1px solid #e8ebf0;box-shadow:0 6px 14px rgba(15,23,36,0.04)}
  .athletes-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .athletes-header h3{margin:0;font-size:18px;display:flex;align-items:center;gap:8px}
  .header-ico{display:inline-flex;align-items:center;justify-content:center}
  .athletes-header p{margin:4px 0 0;color:#6b7280}
  .athlete-count{background:#eef1f5;padding:6px 12px;border-radius:999px;color:#111;font-weight:600;font-size:13px;border:1px solid #e2e6ec}
  .athlete-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .athlete-card{background:#f7f8fb;border-radius:12px;padding:12px;border:1px solid #e8ebf0;min-height:120px}
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

  textarea{width:100%;border-radius:10px;border:1px solid #e8ebf0;background:#f5f6f9;padding:12px;font-family:inherit;resize:vertical;min-height:130px;color:#111}
  textarea::placeholder{color:#9ca3af}

  .save-btn{margin-top:8px;width:100%;padding:14px;border-radius:10px;border:none;background:#e11d2f;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 10px 26px rgba(225,29,47,0.15)}
  .save-btn:hover{background:#c9152a}
  .save-ico{font-size:16px}

  @media (max-width:1000px){
    .content-grid{grid-template-columns:1fr}
    .athlete-grid{grid-template-columns:1fr 1fr}
  }

  @media (max-width:640px){
    .select-row{grid-template-columns:1fr}
    .athlete-grid{grid-template-columns:1fr}
  }
</style>
