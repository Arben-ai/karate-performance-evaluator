<script>
  import { onMount, onDestroy } from 'svelte';
  import NavBar from '$lib/NavBar.svelte';
  import { evaluations } from '$lib/stores/evaluations';

  export let data;

  const collator = new Intl.Collator('de', { sensitivity: 'base', ignorePunctuation: true });
  const normalize = (v) => (v || '').toString().trim().toLowerCase();
  const athleteId = (a) => {
    if (!a) return '';
    if (typeof a._id === 'string') return a._id;
    if (a?._id?.$oid) return a._id.$oid.toString();
    if (typeof a?._id?.toString === 'function' && a._id.toString() !== '[object Object]') return a._id.toString();
    if (typeof a?.id === 'string') return a.id;
    return '';
  };
  const displayName = (a) => (a?.athlete || a?.name || '').toString().trim();

  const defaultDetails = [
    { label: 'Präzision', value: 0 },
    { label: 'Technik', value: 0 },
    { label: 'Geschwindigkeit', value: 0 },
    { label: 'Fokus', value: 0 },
    { label: 'Ausdruck', value: 0 }
  ];

  let athletes = data?.athletes || [];
  let evalList = [];
  let unsub;

  let selected1 = '';
  let selected2 = '';
  let search1 = '';
  let search2 = '';
  let open1 = false;
  let open2 = false;
  let compareMode = false;

  const dedupe = (list = []) => {
    const map = new Map();
    list.forEach((a) => {
      const key = athleteId(a) || displayName(a);
      if (key && !map.has(key)) map.set(key, a);
    });
    return Array.from(map.values());
  };

  onMount(async () => {
    try {
      const res = await fetch('/api/athletes');
      if (res.ok) {
        const fresh = await res.json();
        athletes = dedupe([...(fresh || []), ...athletes]);
      }
    } catch (e) {
      console.warn('athletes fetch failed', e);
    }
    unsub = evaluations.subscribe((val) => {
      evalList = val || [];
    });
  });

  onDestroy(() => {
    unsub?.();
  });

  const labelForSelection = (id) => {
    if (!id) return '';
    const byId = athletes.find((a) => athleteId(a) === id);
    if (byId) return displayName(byId);
    const normId = normalize(id);
    const byName = athletes.find((a) => normalize(displayName(a)) === normId);
    return byName ? displayName(byName) : '';
  };

  const optionFor = (a) => {
    const value = athleteId(a) || displayName(a);
    if (!value) return null;
    return { value, label: displayName(a), coach: a?.coach || '' };
  };

  $: baseOptions = athletes
    .map(optionFor)
    .filter(Boolean)
    .sort((a, b) => collator.compare(a.label, b.label));

  const optionsFor = (blockedId) => baseOptions.filter((o) => o.value !== (blockedId || ''));

  $: options1 = optionsFor(selected2);
  $: options2 = optionsFor(selected1);

  $: if (selected1 && selected1 === selected2) {
    selected2 = '';
  }
  $: if (!compareMode) {
    selected2 = '';
    search2 = '';
    open2 = false;
  }

  function setSelection(slot, term) {
    const opts = slot === 1 ? options1 : options2;
    const match = opts.find((o) => normalize(o.label) === normalize(term));
    if (!match) {
      if (slot === 1) {
        selected1 = '';
        search1 = term;
        open1 = true;
      } else {
        selected2 = '';
        search2 = term;
        open2 = true;
      }
      return;
    }
    if (slot === 1) {
      selected1 = match.value;
      search1 = match.label;
      open1 = false;
      if (selected2 === match.value) selected2 = '';
    } else {
      selected2 = match.value;
      search2 = match.label;
      open2 = false;
      if (selected1 === match.value) selected1 = '';
    }
  }

  $: search1 = selected1 ? labelForSelection(selected1) : search1;
  $: search2 = selected2 ? labelForSelection(selected2) : search2;

  const filterOptions = (term, opts) => {
    const t = normalize(term);
    if (!t) return opts;
    return opts.filter((o) => normalize(o.label).includes(t));
  };

  $: filtered1 = filterOptions(search1, options1);
  $: filtered2 = filterOptions(search2, options2);

  const ts = (v) => {
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.getTime();
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      const iso = Date.parse(trimmed);
      if (!Number.isNaN(iso)) return iso;
      const m = trimmed.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})$/);
      if (m) {
        const day = Number(m[1]);
        const month = Number(m[2]);
        const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
        const parsed = new Date(year, month - 1, day).getTime();
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return NaN;
  };

  const findAthleteBySelection = (sel) => {
    if (!sel) return null;
    const byId = athletes.find((a) => athleteId(a) === sel.toString());
    if (byId) return byId;
    const normSel = normalize(sel);
    return athletes.find((a) => normalize(displayName(a)) === normSel) || null;
  };

  const computeStats = (id) => {
    if (!id) {
      return {
        name: '',
        current: '-',
        delta: 0,
        bestDisc: '-',
        bestDiscScore: '-',
        bestCritLabel: 'Bestes Kriterium',
        bestCritScore: '-',
        sessions: 0,
        sessionDelta: 0,
        details: defaultDetails,
        bench: defaultDetails.map((d) => ({ ...d, value: 70 }))
      };
    }
    const athlete = findAthleteBySelection(id);
    const name = displayName(athlete);
    const evs = evalList
      .filter((ev) => normalize(ev?.athlete) === normalize(name))
      .sort((a, b) => ts(b?.date) - ts(a?.date));

    const currentScore = evs.length ? Number(evs[0].score) || 0 : '-';
    const delta =
      evs.length > 1 ? Math.round((Number(evs[0].score) || 0) - (Number(evs[1].score) || 0)) : 0;
    const bestDisc = evs[0]?.discipline || '-';
    const bestDiscScore = evs[0]?.score ?? '-';

    const details =
      Array.isArray(evs[0]?.details) && evs[0].details.length
        ? evs[0].details.map((d) => ({ label: d?.label || 'Kriterium', value: Number(d?.value) || 0 }))
        : defaultDetails;

    const bench =
      evs.length > 1 && Array.isArray(evs[1]?.details) && evs[1].details.length
        ? evs[1].details.map((d) => ({ label: d?.label || 'Kriterium', value: Number(d?.value) || 0 }))
        : defaultDetails.map((d) => ({ ...d, value: 70 }));

    const bestCrit = details.reduce(
      (best, cur) => (Number(cur.value) > Number(best.value) ? cur : best),
      details[0] || { label: 'Kriterium', value: 0 }
    );

    return {
      name,
      current: currentScore,
      delta,
      bestDisc,
      bestDiscScore,
      bestCritLabel: bestCrit?.label || 'Bestes Kriterium',
      bestCritScore: bestCrit?.value ?? '-',
      sessions: evs.length,
      sessionDelta: evs.length > 1 ? evs.length - 1 : 0,
      details,
      bench
    };
  };

  $: stats1 = computeStats(selected1);
  $: stats2 = computeStats(selected2);

  const radarPoints = (items = [], size = 360) => {
    const max = 100;
    const r = size / 2 - 28;
    const cx = size / 2;
    const cy = size / 2;
    return items
      .map((item, idx) => {
        const angle = (Math.PI * 2 * idx) / items.length - Math.PI / 2;
        const val = Math.max(0, Math.min(max, Number(item?.value) || 0));
        const dist = r * (val / max);
        const x = cx + dist * Math.cos(angle);
        const y = cy + dist * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const tooltipDefaults = { visible: false, label: '', current: 0, benchmark: 0, x: 0, y: 0 };
  let tooltip1 = { ...tooltipDefaults };
  let tooltip2 = { ...tooltipDefaults };
  let radar1El;
  let radar2El;
  let radarWrap1El;
  let radarWrap2El;

  function pointCoord(items, idx, size) {
    const max = 100;
    const r = size / 2 - 28;
    const angle = (Math.PI * 2 * idx) / items.length - Math.PI / 2;
    const val = Math.max(0, Math.min(max, Number(items[idx]?.value) || 0));
    const dist = r * (val / max);
    const x = size / 2 + dist * Math.cos(angle);
    const y = size / 2 + dist * Math.sin(angle);
    return { x, y };
  }

  function showTip(chart, items, bench, idx, size, svgEl, wrapEl) {
    const pos = pointCoord(items, idx, size);
    const center = size / 2;
    const angle = (Math.PI * 2 * idx) / items.length - Math.PI / 2;
    const r = size / 2 - 28;
    const outDist = r + 56;
    const posOut = {
      x: center + Math.cos(angle) * outDist,
      y: center + Math.sin(angle) * outDist
    };
    const benchVal = Number(bench?.[idx]?.value) || 0;
    let x = pos.x;
    let y = pos.y;
    if (svgEl && wrapEl) {
      const svgRect = svgEl.getBoundingClientRect();
      const wrapRect = wrapEl.getBoundingClientRect();
      const scale = svgRect.width / size;
      x = svgRect.left - wrapRect.left + posOut.x * scale;
      y = svgRect.top - wrapRect.top + posOut.y * scale;
      const margin = 16;
      x = Math.max(margin, Math.min(wrapRect.width - margin, x));
      y = Math.max(margin, Math.min(wrapRect.height - margin, y));
    }
    const state = {
      visible: true,
      label: items[idx]?.label || 'Kriterium',
      current: Number(items[idx]?.value) || 0,
      benchmark: benchVal,
      x,
      y
    };
    if (chart === 1) tooltip1 = state;
    else tooltip2 = state;
  }

  function hideTip(chart) {
    if (chart === 1) tooltip1 = { ...tooltipDefaults };
    else tooltip2 = { ...tooltipDefaults };
  }

  const palette = {
    kata: '#e11d2f',
    kumite: '#0f1724'
  };

  const formatMonth = (d) => {
    try {
      return new Date(d).toLocaleDateString('de-CH', { month: 'short', year: '2-digit' });
    } catch {
      return d || '';
    }
  };

  const buildTimeline = (id) => {
    if (!id) return null;
    const athlete = findAthleteBySelection(id) || athletes.find((a) => normalize(displayName(a)) === normalize(id));
    const name = displayName(athlete) || id?.toString();
    if (!name) return null;
    const rows = (evalList || [])
      .filter((ev) => normalize(ev?.athlete) === normalize(name))
      .map((ev) => {
        const t = ts(ev?.date || ev?.createdAt);
        const dateObj = Number.isFinite(t) ? new Date(t) : null;
        return {
          dateObj,
          discipline: ev?.discipline || '-',
          score: Number(ev?.score) || 0
        };
      })
      .filter((row) => row.dateObj instanceof Date && !Number.isNaN(row.dateObj.getTime()))
      .sort((a, b) => a.dateObj - b.dateObj);

    if (!rows.length) return null;

    const buckets = [];
    rows.forEach((row) => {
      const d = row.dateObj;
      const key = d.toISOString().slice(0, 10);
      let bucket = buckets.find((b) => b.key === key);
      if (!bucket) {
        bucket = { key, dateObj: d, values: new Map() };
        buckets.push(bucket);
      }
      bucket.values.set(row.discipline, row.score);
    });

    const labels = buckets.map((b) => b.dateObj);
    const disciplines = new Set();
    buckets.forEach((b) => b.values.forEach((_, disc) => disciplines.add(disc)));

    const series = Array.from(disciplines).map((disc, idx) => {
      const values = buckets.map((b) => b.values.get(disc) ?? null);
      const color =
        palette[disc?.toLowerCase()] ||
        ['#e11d2f', '#0f1724', '#0ea5e9', '#f59e0b'][idx % 4];
      return { name: disc, color, values };
    });

    return { labels, series };
  };

  $: timeline1 = buildTimeline(selected1);
  $: timeline2 = buildTimeline(selected2);

  const chartDims = (labels = [], height = 220) => {
    const width = 640;
    const pad = { left: 50, right: 20, top: 10, bottom: 36 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const xPos = (idx) =>
      pad.left +
      (labels.length > 1 ? (innerW * idx) / Math.max(1, labels.length - 1) : 0);
    const yPos = (val) => pad.top + innerH * (1 - Math.max(0, Math.min(100, val)) / 100);
    return { width, height, pad, innerW, innerH, xPos, yPos };
  };

  const buildPath = (labels = [], values = [], dims) => {
    let d = '';
    values.forEach((v, idx) => {
      if (v == null) return;
      const x = dims.xPos(idx);
      const y = dims.yPos(v);
      d += d ? ` L ${x} ${y}` : `M ${x} ${y}`;
    });
    return d;
  };

  const pointList = (labels = [], values = [], dims) =>
    values.map((v, idx) =>
      v == null ? null : { x: dims.xPos(idx), y: dims.yPos(v), label: labels[idx], value: v }
    );

  $: lineHeight = compareMode ? 220 : 170;
  $: dims1 = chartDims(timeline1?.labels || [], lineHeight);
  $: dims2 = chartDims(timeline2?.labels || [], lineHeight);

  const emptyLineTip = { visible: false, x: 0, y: 0, label: '', rows: [] };
  let lineTip1 = { ...emptyLineTip };
  let lineTip2 = { ...emptyLineTip };
  let lineWrap1El;
  let lineWrap2El;
  let lineSvg1El;
  let lineSvg2El;

  function showLineTip(chart, idx, dims, svgEl, wrapEl) {
    const tl = chart === 1 ? timeline1 : timeline2;
    if (!tl) return;
    const label = tl.labels?.[idx];
    const rows =
      tl.series?.map((s) => ({
        name: s.name,
        color: s.color,
        value: s.values?.[idx] ?? '-'
      })) || [];
    const numericVals = rows.map((r) => (typeof r.value === 'number' ? r.value : null)).filter((v) => v != null);
    const yVal = numericVals.length ? Math.min(...numericVals) : 50;
    let x = dims.xPos(idx);
    let y = dims.yPos(yVal) - 14;
    if (svgEl && wrapEl) {
      const svgRect = svgEl.getBoundingClientRect();
      const wrapRect = wrapEl.getBoundingClientRect();
      const scale = svgRect.width / dims.width;
      x = svgRect.left - wrapRect.left + x * scale;
      y = svgRect.top - wrapRect.top + y * scale;
      const margin = 16;
      x = Math.max(margin, Math.min(wrapRect.width - margin, x));
      y = Math.max(margin, Math.min(wrapRect.height - margin, y));
    }
    const state = {
      visible: true,
      x,
      y,
      label: formatMonth(label),
      rows
    };
    if (chart === 1) lineTip1 = state;
    else lineTip2 = state;
  }

  function hideLineTip(chart) {
    if (chart === 1) lineTip1 = { ...emptyLineTip };
    else lineTip2 = { ...emptyLineTip };
  }
</script>

<div class="app-shell">
  <NavBar active="analyse" />

  <main class="page container">
    <header class="page-header">
      <h1>Performance Analyse &amp; Vergleich</h1>
      <p class="muted">Einzelne Athleten analysieren oder zwei Athleten direkt vergleichen</p>
    </header>

    <section class={`filters bare ${compareMode ? 'compare' : 'single'}`}>
      <div class="field-box">
        <div class="field">
          <label for="athlete1">1. Athlet auswählen</label>
          <div class="select-wrap">
            <input
              id="athlete1"
              type="search"
              placeholder="Athlet auswählen oder tippen..."
              bind:value={search1}
              on:input={(e) => { setSelection(1, e.target.value); open1 = true; }}
              on:focus={() => (open1 = true)}
              on:blur={() => setTimeout(() => (open1 = false), 80)}
            />
            {#if open1 && filtered1.length}
              <div class="suggest-panel">
                {#each filtered1 as opt}
                  <button
                    type="button"
                    class="suggest-item"
                    on:mousedown|preventDefault={() => setSelection(1, opt.label)}
                  >
                    {opt.label}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          {#if selected1}
            <div class="selected-hint">Ausgewählt: {labelForSelection(selected1)}</div>
          {/if}
        </div>
      </div>

      {#if compareMode}
        <div class="field-box">
          <div class="field">
            <label for="athlete2">2. Athlet auswählen</label>
            <div class="select-wrap">
              <input
                id="athlete2"
                type="search"
                placeholder="Athlet auswählen oder tippen..."
                bind:value={search2}
                on:input={(e) => { setSelection(2, e.target.value); open2 = true; }}
                on:focus={() => (open2 = true)}
                on:blur={() => setTimeout(() => (open2 = false), 80)}
              />
              {#if open2 && filtered2.length}
                <div class="suggest-panel">
                  {#each filtered2 as opt}
                    <button
                      type="button"
                      class="suggest-item"
                      on:mousedown|preventDefault={() => setSelection(2, opt.label)}
                    >
                      {opt.label}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            {#if selected2}
              <div class="selected-hint">Ausgewählt: {labelForSelection(selected2)}</div>
            {/if}
          </div>
        </div>
      {/if}
      <div class="field-box compare-toggle">
        <label class="toggle">
          <input type="checkbox" bind:checked={compareMode} />
          <span class="toggle-ui"></span>
          <span>Vergleich aktivieren</span>
        </label>
        <p class="toggle-hint">Zweiten Athleten nur bei Bedarf einblenden.</p>
      </div>
    </section>



    <section class={`chart-grid ${compareMode ? 'grid-compare' : 'grid-single'}`}>
      <div class="card chart">
        <div class="chart-header with-score">
          <span>Kompetenzprofil {stats1.name || '-'}</span>
          <span class="score-tag">{stats1.current !== '-' ? `${stats1.current} Punkte` : '-'}</span>
        </div>
        {#if stats1.details && stats1.details.length}
          {#key selected1}
          <div class="chart-body" bind:this={radarWrap1El}>
            <svg viewBox="0 0 360 360" class="radar" bind:this={radar1El}>
              <defs>
                <linearGradient id="radar1Fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#e11d2f" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#e11d2f" stop-opacity="0.15" />
                </linearGradient>
              </defs>
              {#each [20,40,60,80,100] as ring}
                <polygon
                  points={radarPoints(stats1.details.map((d) => ({ ...d, value: ring })), 360)}
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="1"
                  opacity="0.8"
                />
              {/each}
              <polygon points={radarPoints(stats1.bench, 360)} fill="none" stroke="#94a3b8" stroke-dasharray="6 4" stroke-width="2" />
              <g class="radar-animate">
                <polygon points={radarPoints(stats1.details, 360)} fill="url(#radar1Fill)" stroke="#e11d2f" stroke-width="2.5" />

                {#each stats1.details as item, idx}
                <g
                  on:mouseenter={() => showTip(1, stats1.details, stats1.bench, idx, 360, radar1El, radarWrap1El)}
                  on:mouseleave={() => hideTip(1)}
                >
                  {#if item}
                    <circle
                      cx={pointCoord(stats1.details, idx, 360).x}
                      cy={pointCoord(stats1.details, idx, 360).y}
                      r="6"
                      fill="#e11d2f"
                      stroke="#fff"
                      stroke-width="2"
                    />
                    <circle
                      cx={pointCoord(stats1.details, idx, 360).x}
                      cy={pointCoord(stats1.details, idx, 360).y}
                      r="14"
                      fill="transparent"
                      pointer-events="all"
                    />
                    <circle
                      cx={pointCoord(stats1.bench, idx, 360).x}
                      cy={pointCoord(stats1.bench, idx, 360).y}
                      r="5"
                      fill="#94a3b8"
                      stroke="#fff"
                      stroke-width="2"
                    />
                    <circle
                      cx={pointCoord(stats1.bench, idx, 360).x}
                      cy={pointCoord(stats1.bench, idx, 360).y}
                      r="12"
                      fill="transparent"
                      pointer-events="all"
                    />
                  {#if ['Fokus', 'Geschwindigkeit'].includes(item.label)}
                    <text
                      x={180 + 158 * Math.cos((Math.PI * 2 * idx) / stats1.details.length - Math.PI / 2)}
                      y={180 + 158 * Math.sin((Math.PI * 2 * idx) / stats1.details.length - Math.PI / 2) + 6}
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="#4b5563"
                      font-size="12"
                      font-weight="600"
                    >
                      {item.label}
                    </text>
                  {:else}
                    <text
                      x={180 + 158 * Math.cos((Math.PI * 2 * idx) / stats1.details.length - Math.PI / 2)}
                      y={180 + 158 * Math.sin((Math.PI * 2 * idx) / stats1.details.length - Math.PI / 2) - 6}
                      text-anchor="middle"
                      dominant-baseline="middle"
                      fill="#4b5563"
                      font-size="12"
                      font-weight="600"
                    >
                      {item.label}
                    </text>
                  {/if}
                  {/if}
                </g>
                {/each}
              </g>
            </svg>
            {#if tooltip1.visible}
              <div class="tooltip" style={`left:${tooltip1.x}px; top:${tooltip1.y}px;`}>
                <div class="tooltip-title">{tooltip1.label}</div>
                <div class="tooltip-row"><span>Aktuell:</span><span class="current">{tooltip1.current}</span></div>
                <div class="tooltip-row"><span>Benchmark:</span><span class="bench">{tooltip1.benchmark}</span></div>
                <div class="tooltip-row">
                  <span>Differenz:</span>
                  <span class={tooltip1.current - tooltip1.benchmark >= 0 ? 'pos' : 'neg'}>
                    {tooltip1.current - tooltip1.benchmark >= 0 ? '+' : ''}{tooltip1.current - tooltip1.benchmark}
                  </span>
                </div>
              </div>
            {/if}
          </div>
          <div class="legend">
            <div class="dot current"></div><span>Aktuell</span>
            <div class="dot bench"></div><span>Benchmark</span>
          </div>
          {/key}
        {:else}
          <div class="chart-body muted">Keine Bewertung vorhanden.</div>
        {/if}
      </div>

      {#if compareMode}
        <div class="card chart">
          <div class="chart-header with-score">
            <span>Kompetenzprofil {stats2.name || '-'}</span>
            <span class="score-tag">{stats2.current !== '-' ? `${stats2.current} Punkte` : '-'}</span>
          </div>
          {#if stats2.details && stats2.details.length}
            {#key selected2}
            <div class="chart-body" bind:this={radarWrap2El}>
              <svg viewBox="0 0 360 360" class="radar" bind:this={radar2El}>
                <defs>
                  <linearGradient id="radar2Fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.15" />
                  </linearGradient>
                </defs>
                {#each [20,40,60,80,100] as ring}
                  <polygon
                    points={radarPoints(stats2.details.map((d) => ({ ...d, value: ring })), 360)}
                    fill="none"
                    stroke="#e5e7eb"
                    stroke-width="1"
                    opacity="0.8"
                  />
                {/each}
                <polygon points={radarPoints(stats2.bench, 360)} fill="none" stroke="#94a3b8" stroke-dasharray="6 4" stroke-width="2" />
                <g class="radar-animate">
                  <polygon points={radarPoints(stats2.details, 360)} fill="url(#radar2Fill)" stroke="#0ea5e9" stroke-width="2.5" />

                  {#each stats2.details as item, idx}
                  <g
                    on:mouseenter={() => showTip(2, stats2.details, stats2.bench, idx, 360, radar2El, radarWrap2El)}
                    on:mouseleave={() => hideTip(2)}
                  >
                    <circle
                      cx={pointCoord(stats2.details, idx, 360).x}
                      cy={pointCoord(stats2.details, idx, 360).y}
                      r="6"
                      fill="#0ea5e9"
                      stroke="#fff"
                      stroke-width="2"
                    />
                    <circle
                      cx={pointCoord(stats2.details, idx, 360).x}
                      cy={pointCoord(stats2.details, idx, 360).y}
                      r="14"
                      fill="transparent"
                      pointer-events="all"
                    />
                    <circle
                      cx={pointCoord(stats2.bench, idx, 360).x}
                      cy={pointCoord(stats2.bench, idx, 360).y}
                      r="5"
                      fill="#94a3b8"
                      stroke="#fff"
                      stroke-width="2"
                    />
                    <circle
                      cx={pointCoord(stats2.bench, idx, 360).x}
                      cy={pointCoord(stats2.bench, idx, 360).y}
                      r="12"
                      fill="transparent"
                      pointer-events="all"
                    />
                    {#if ['Fokus', 'Geschwindigkeit'].includes(item.label)}
                      <text
                        x={180 + 158 * Math.cos((Math.PI * 2 * idx) / stats2.details.length - Math.PI / 2)}
                        y={180 + 158 * Math.sin((Math.PI * 2 * idx) / stats2.details.length - Math.PI / 2) + 6}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#4b5563"
                        font-size="12"
                        font-weight="600"
                      >
                        {item.label}
                      </text>
                    {:else}
                      <text
                        x={180 + 158 * Math.cos((Math.PI * 2 * idx) / stats2.details.length - Math.PI / 2)}
                        y={180 + 158 * Math.sin((Math.PI * 2 * idx) / stats2.details.length - Math.PI / 2) - 6}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#4b5563"
                        font-size="12"
                        font-weight="600"
                      >
                        {item.label}
                      </text>
                    {/if}
                  </g>
                  {/each}
                </g>
              </svg>
              {#if tooltip2.visible}
                <div class="tooltip" style={`left:${tooltip2.x}px; top:${tooltip2.y}px;`}>
                  <div class="tooltip-title">{tooltip2.label}</div>
                  <div class="tooltip-row"><span>Aktuell:</span><span class="current">{tooltip2.current}</span></div>
                  <div class="tooltip-row"><span>Benchmark:</span><span class="bench">{tooltip2.benchmark}</span></div>
                  <div class="tooltip-row">
                    <span>Differenz:</span>
                    <span class={tooltip2.current - tooltip2.benchmark >= 0 ? 'pos' : 'neg'}>
                      {tooltip2.current - tooltip2.benchmark >= 0 ? '+' : ''}{tooltip2.current - tooltip2.benchmark}
                    </span>
                  </div>
                </div>
              {/if}
            </div>
            <div class="legend">
              <div class="dot current"></div><span>Aktuell</span>
              <div class="dot bench"></div><span>Benchmark</span>
            </div>
            {/key}
          {:else}
            <div class="chart-body muted">Keine Bewertung vorhanden.</div>
          {/if}
        </div>
      {/if}
    </section>

    <section class={`line-charts ${compareMode ? 'grid-compare' : 'grid-single'}`}>
      <div class="card line-card">
        <div class="chart-header">Entwicklung über Zeit {stats1.name || ''}</div>
          {#if timeline1}
            {#key selected1}
            <div class="line-chart" bind:this={lineWrap1El}>
            <svg bind:this={lineSvg1El} viewBox={`0 0 ${dims1.width} ${dims1.height}`} preserveAspectRatio="xMidYMid meet" on:mouseleave={() => hideLineTip(1)}>
              <g class="line-grid">
                {#each [0,25,50,75,100] as tick}
                  <line
                    x1="0"
                    x2={dims1.width}
                    y1={dims1.yPos(tick)}
                    y2={dims1.yPos(tick)}
                    stroke="#e5e7eb"
                    stroke-dasharray="4 4"
                  />
                  <text x="12" y={dims1.yPos(tick) + 4} fill="#6b7280" font-size="12">{tick}</text>
                {/each}
              </g>

              {#each timeline1.series as s (s.name)}
                <path
                  class="line-path"
                  d={buildPath(timeline1.labels, s.values, dims1)}
                  fill="none"
                  stroke={s.color}
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                {#each pointList(timeline1.labels, s.values, dims1) as pt, idx (idx)}
                  {#if pt}
                    <circle
                      class="line-point"
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      fill={s.color}
                      stroke="#fff"
                      stroke-width="2.5"
                      style={`--idx:${idx}`}
                    >
                      <title>{s.name}: {pt.value}</title>
                    </circle>
                    <rect
                      x={pt.x - 12}
                      y={pt.y - 12}
                      width="24"
                      height="24"
                      fill="transparent"
                      on:mouseenter={() => showLineTip(1, idx, dims1, lineSvg1El, lineWrap1El)}
                      on:mouseleave={() => hideLineTip(1)}
                    />
                  {/if}
                {/each}
              {/each}

              {#each timeline1.labels as d, idx}
                <rect
                  x={dims1.xPos(idx) - Math.max(18, dims1.innerW / Math.max(12, timeline1.labels.length * 2))}
                  y="0"
                  width={Math.max(36, (dims1.innerW / Math.max(6, timeline1.labels.length)) )}
                  height={dims1.height}
                  fill="transparent"
                  on:mouseenter={() => showLineTip(1, idx, dims1, lineSvg1El, lineWrap1El)}
                />
              {/each}

              {#each timeline1.labels as d, idx}
                <line
                  x1={dims1.xPos(idx)}
                  x2={dims1.xPos(idx)}
                  y1={dims1.pad.top}
                  y2={dims1.height - dims1.pad.bottom}
                  stroke="#f3f4f6"
                />
                <text
                  x={dims1.xPos(idx)}
                  y={dims1.height - 10}
                  text-anchor="middle"
                  fill="#6b7280"
                  font-size="12"
                >
                  {formatMonth(d)}
                </text>
              {/each}
              </svg>
              <div class="line-legend">
                {#each timeline1.series as s (s.name)}
                  <span class="legend-item">
                    <span class="legend-dot" style={`background:${s.color}`}></span>{s.name}
                  </span>
                {/each}
              </div>
              {#if lineTip1.visible}
                <div
                  class="line-tooltip"
                  style={`left:${lineTip1.x}px; top:${lineTip1.y}px;`}
                >
                  <div class="line-tip-title">{lineTip1.label}</div>
                  {#each lineTip1.rows as row (row.name)}
                    <div class="line-tip-row">
                      <span style={`color:${row.color}`}>{row.name}</span>
                      <span>{row.value}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
            {/key}
          {:else}
            <div class="chart-body muted">Keine Bewertung vorhanden.</div>
          {/if}
        </div>

      {#if compareMode}
        <div class="card line-card">
          <div class="chart-header">Entwicklung über Zeit {stats2.name || ''}</div>
            {#if timeline2}
              {#key selected2}
              <div class="line-chart" bind:this={lineWrap2El}>
              <svg bind:this={lineSvg2El} viewBox={`0 0 ${dims2.width} ${dims2.height}`} preserveAspectRatio="xMidYMid meet" on:mouseleave={() => hideLineTip(2)}>
                <g class="line-grid">
                  {#each [0,25,50,75,100] as tick}
                    <line
                      x1="0"
                      x2={dims2.width}
                      y1={dims2.yPos(tick)}
                      y2={dims2.yPos(tick)}
                      stroke="#e5e7eb"
                      stroke-dasharray="4 4"
                    />
                    <text x="12" y={dims2.yPos(tick) + 4} fill="#6b7280" font-size="12">{tick}</text>
                  {/each}
                </g>

                {#each timeline2.series as s (s.name)}
                  <path
                    class="line-path"
                    d={buildPath(timeline2.labels, s.values, dims2)}
                    fill="none"
                    stroke={s.color}
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  {#each pointList(timeline2.labels, s.values, dims2) as pt, idx (idx)}
                    {#if pt}
                      <circle
                        class="line-point"
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill={s.color}
                        stroke="#fff"
                        stroke-width="2.5"
                        style={`--idx:${idx}`}
                      >
                        <title>{s.name}: {pt.value}</title>
                      </circle>
                      <rect
                        x={pt.x - 12}
                        y={pt.y - 12}
                        width="24"
                        height="24"
                        fill="transparent"
                      on:mouseenter={() => showLineTip(2, idx, dims2, lineSvg2El, lineWrap2El)}
                      on:mouseleave={() => hideLineTip(2)}
                    />
                  {/if}
                {/each}
              {/each}

                {#each timeline2.labels as d, idx}
                  <rect
                    x={dims2.xPos(idx) - Math.max(18, dims2.innerW / Math.max(12, timeline2.labels.length * 2))}
                    y="0"
                    width={Math.max(36, (dims2.innerW / Math.max(6, timeline2.labels.length)) )}
                    height={dims2.height}
                    fill="transparent"
                  on:mouseenter={() => showLineTip(2, idx, dims2, lineSvg2El, lineWrap2El)}
                />
              {/each}

                {#each timeline2.labels as d, idx}
                  <line
                    x1={dims2.xPos(idx)}
                    x2={dims2.xPos(idx)}
                    y1={dims2.pad.top}
                    y2={dims2.height - dims2.pad.bottom}
                    stroke="#f3f4f6"
                  />
                  <text
                    x={dims2.xPos(idx)}
                    y={dims2.height - 10}
                    text-anchor="middle"
                    fill="#6b7280"
                    font-size="12"
                  >
                    {formatMonth(d)}
                  </text>
                {/each}
                </svg>
                <div class="line-legend">
                  {#each timeline2.series as s (s.name)}
                    <span class="legend-item">
                      <span class="legend-dot" style={`background:${s.color}`}></span>{s.name}
                    </span>
                  {/each}
                </div>
                {#if lineTip2.visible}
                  <div
                    class="line-tooltip"
                    style={`left:${lineTip2.x}px; top:${lineTip2.y}px;`}
                  >
                    <div class="line-tip-title">{lineTip2.label}</div>
                    {#each lineTip2.rows as row (row.name)}
                      <div class="line-tip-row">
                        <span style={`color:${row.color}`}>{row.name}</span>
                        <span>{row.value}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
              {/key}
            {:else}
              <div class="chart-body muted">Keine Bewertung vorhanden.</div>
            {/if}
          </div>
      {/if}
    </section>
  </main>
</div>

<style>
  :global(body){background:#f7f8fb;}
  .page.container{max-width:1200px;margin:24px auto;padding:0 20px}
  .page-header h1{margin:0;font-size:28px;font-weight:700}
  .page-header .muted{margin:4px 0 0;color:#6b7280;font-size:14px}
  .filters{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px}
  .filters.single{grid-template-columns:1fr}
  .filters.compare{grid-template-columns:1fr 1fr}
  .field-box{padding:12px;border:1px solid #eef1f5;border-radius:10px;background:#fff;overflow:visible}
  .field label{display:block;font-weight:700;font-size:14px;margin-bottom:6px;color:#111}
  .field input{
    width:100%;
    padding:12px 14px;
    border-radius:12px;
    border:1px solid #e5e7eb;
    background:#f8fafc;
    font-size:15px;
    color:#111;
    box-shadow:0 6px 14px rgba(15,23,36,0.06) inset,0 4px 10px rgba(15,23,36,0.04);
    transition:border-color .15s ease,box-shadow .15s ease,background .15s ease;
  }
  .field input:focus{outline:none;border-color:#e11d2f;box-shadow:0 0 0 3px rgba(225,29,47,0.15),0 6px 14px rgba(15,23,36,0.06) inset}
  .field input::placeholder{color:#94a3b8}
  .selected-hint{margin-top:6px;font-size:13px;color:#6b7280}
  .select-wrap{position:relative}
  .suggest-panel{
    position:absolute;
    top:calc(100% + 6px);
    left:0;right:0;
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:12px;
    box-shadow:0 14px 28px rgba(15,23,36,0.14);
    max-height:260px;
    overflow:auto;
    z-index:50;
    padding:6px 0;
  }
  .suggest-item{
    width:100%;
    text-align:left;
    border:0;
    background:#fff;
    padding:12px 16px;
    font-size:15px;
    color:#0f1724;
    cursor:pointer;
    transition:background .12s ease,color .12s ease;
  }
  .suggest-item:hover{background:#f8fafc;color:#0f1724}
  .compare-toggle{grid-column:1 / -1}
  .toggle{display:flex;align-items:center;gap:12px;font-weight:700;font-size:14px;color:#0f1724}
  .toggle input{position:absolute;opacity:0;pointer-events:none}
  .toggle-ui{width:44px;height:24px;border-radius:999px;background:#e5e7eb;position:relative;transition:background .15s ease}
  .toggle-ui::after{
    content:'';
    position:absolute;
    top:3px;
    left:3px;
    width:18px;
    height:18px;
    border-radius:50%;
    background:#fff;
    box-shadow:0 2px 6px rgba(15,23,36,0.2);
    transition:transform .15s ease;
  }
  .toggle input:checked + .toggle-ui{background:#e11d2f}
  .toggle input:checked + .toggle-ui::after{transform:translateX(20px)}
  .toggle-hint{margin:6px 0 0 56px;font-size:13px;color:#6b7280}

  .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
  .chart-grid.grid-single{grid-template-columns:1fr}
  .chart{padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}
  .chart-header{font-weight:700;margin-bottom:10px}
  .chart-header.with-score{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .score-tag{font-size:14px;font-weight:700;color:#0f1724;background:#f4f5f9;border:1px solid #e5e7eb;border-radius:999px;padding:6px 10px;min-width:72px;text-align:right}
  .chart-body{position:relative;display:flex;align-items:center;justify-content:center;min-height:360px}
  .chart-body svg{max-width:100%}
  .chart-body.muted{color:#6b7280;font-size:14px;min-height:80px}
  .chart-grid.grid-single .chart-body{min-height:500px}
  .chart-grid.grid-single .chart-body .radar{width:500px;height:500px}

  .radar polygon:first-child{mix-blend-mode:multiply}
  .radar-animate{
    transform-origin:180px 180px;
    animation:radarGrow 520ms ease forwards;
  }

  .tooltip{position:absolute;min-width:180px;background:#fff;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,0.18);padding:12px;transform:translate(-50%, -50%);z-index:30;border:1px solid #e5e7eb}
  .tooltip-title{font-weight:700;font-size:16px;margin-bottom:8px}
  .tooltip-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:14px}
  .tooltip-row:last-child{margin-bottom:0}
  .tooltip .current{color:#e11d2f;font-weight:700}
  .tooltip .bench{color:#4b5563;font-weight:700}
  .tooltip .pos{color:#0ea854;font-weight:700}
  .tooltip .neg{color:#b91c1c;font-weight:700}

  .legend{display:flex;align-items:center;gap:10px;margin-top:10px;font-weight:600;color:#111}
  .legend .dot{width:14px;height:14px;border-radius:50%}
  .legend .dot.current{background:#e11d2f}
  .legend .dot.bench{background:#94a3b8;border:2px dashed #94a3b8}

  .line-charts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
  .line-charts.grid-single{grid-template-columns:1fr}
  .line-card{padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}
  .line-chart{display:flex;flex-direction:column;gap:10px;position:relative}
  .line-chart svg{width:100%;height:auto}
  .line-path{
    stroke-dasharray:1200;
    stroke-dashoffset:1200;
    animation:lineDraw 700ms ease forwards;
  }
  .line-point{
    opacity:0;
    transform-origin:center;
    animation:pointIn 280ms ease forwards;
    animation-delay:calc(var(--idx, 0) * 70ms + 200ms);
  }
  .line-legend{display:flex;gap:12px;flex-wrap:wrap;font-weight:700;color:#111}
  .line-legend .legend-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:middle}
  .line-tooltip{
    position:absolute;
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:10px;
    padding:10px 12px;
    box-shadow:0 12px 20px rgba(0,0,0,0.12);
    transform:translate(-50%,-50%);
    min-width:140px;
    z-index:10;
  }
  .line-tip-title{font-weight:700;font-size:14px;margin-bottom:6px}
  .line-tip-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;margin:2px 0}

  .strength-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
  .strengths, .weaknesses{padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}
  .pill-list{display:flex;flex-direction:column;gap:10px}
  .pill-item{background:rgba(16,185,129,0.12);border-radius:10px;padding:10px 12px;font-weight:600;color:#065f46}
  .pill-list.orange .pill-item{background:rgba(251,146,60,0.12);color:#9a3412}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}
  .dot.green{background:#0ea854}
  .dot.orange{background:#f59e0b}
  .hint{margin-top:10px;padding:10px 12px;background:#f7f8fb;border-radius:10px;color:#374151;font-size:13px;border:1px solid #eef1f5}

  @keyframes radarGrow{
    from{opacity:0;transform:scale(0.2)}
    to{opacity:1;transform:scale(1)}
  }

  @keyframes lineDraw{
    from{stroke-dashoffset:1200}
    to{stroke-dashoffset:0}
  }

  @keyframes pointIn{
    from{opacity:0;transform:scale(0.6)}
    to{opacity:1;transform:scale(1)}
  }

  @media (prefers-reduced-motion: reduce){
    .radar-animate,
    .line-path,
    .line-point{
      animation:none;
      opacity:1;
      transform:none;
      stroke-dashoffset:0;
    }
  }

  @media (max-width:1000px){
    .chart-grid{grid-template-columns:1fr}
    .line-charts{grid-template-columns:1fr}
  }

  @media (max-width:640px){
    .filters{grid-template-columns:1fr}
  }
</style>
