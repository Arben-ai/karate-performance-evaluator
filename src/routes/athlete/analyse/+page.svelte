<script>
	import { onMount, onDestroy } from 'svelte';
	import NavBar from '$lib/NavBar.svelte';
	import { evaluations as evaluationStore, normalizeEval } from '$lib/stores/evaluations';
	import { activeAthlete } from '$lib/stores/activeAthlete';
	import {
		buildAthleteOptions,
		dedupeEvaluations,
		findAthleteOption,
		normalizeKey
	} from '$lib/utils/athleteView';

	export let data;

	const defaultDetails = [
		{ label: 'Präzision', value: 0 },
		{ label: 'Technik', value: 0 },
		{ label: 'Geschwindigkeit', value: 0 },
		{ label: 'Fokus', value: 0 },
		{ label: 'Ausdruck', value: 0 }
	];

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

	let athletes = data?.athletes || [];
	let serverEvals = (data?.evaluations || []).map(normalizeEval);
	let clientEvals = [];
	let mergedEvals = [];
	let athleteOptions = [];
	let selectedAthlete = '';
	let activeOption = null;
	let myEvals = [];
	let evalUnsub;
	let activeUnsub;
	let syncedSelection = false;

	const parseTs = (v) => {
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

	onMount(() => {
		evalUnsub = evaluationStore.subscribe((list) => {
			clientEvals = (list || []).map(normalizeEval);
		});
		activeUnsub = activeAthlete.subscribe((value) => {
			if (value) {
				selectedAthlete = value;
				syncedSelection = true;
			}
		});
	});

	onDestroy(() => {
		evalUnsub?.();
		activeUnsub?.();
	});

	$: mergedEvals = dedupeEvaluations([...serverEvals, ...clientEvals]);
	$: athleteOptions = buildAthleteOptions(athletes, mergedEvals);
	$: activeOption = (() => {
		const match = findAthleteOption(athleteOptions, selectedAthlete);
		return match || null;
	})();

	$: if (!syncedSelection && selectedAthlete) {
		activeAthlete.set(selectedAthlete);
		syncedSelection = true;
	}

	$: myEvals = mergedEvals
		.slice()
		.filter((ev) => normalizeKey(ev.athlete || ev.name) === normalizeKey(activeOption?.label))
		.sort((a, b) => parseTs(b?.createdAt || b?.date) - parseTs(a?.createdAt || a?.date));

	$: displayName = activeOption?.label || 'Athlet';

	const computeStats = (evals, name) => {
		if (!evals.length) {
			return {
				name,
				current: '-',
				delta: 0,
				details: defaultDetails,
				bench: defaultDetails.map((d) => ({ ...d, value: 70 }))
			};
		}

		const currentScore = evals.length ? Number(evals[0].score) || 0 : '-';
		const delta =
			evals.length > 1 ? Math.round((Number(evals[0].score) || 0) - (Number(evals[1].score) || 0)) : 0;

		const details =
			Array.isArray(evals[0]?.details) && evals[0].details.length
				? evals[0].details.map((d) => ({ label: d?.label || 'Kriterium', value: Number(d?.value) || 0 }))
				: defaultDetails;

		const bench =
			evals.length > 1 && Array.isArray(evals[1]?.details) && evals[1].details.length
				? evals[1].details.map((d) => ({ label: d?.label || 'Kriterium', value: Number(d?.value) || 0 }))
				: defaultDetails.map((d) => ({ ...d, value: 70 }));

		return {
			name,
			current: currentScore,
			delta,
			details,
			bench
		};
	};

	$: stats1 = computeStats(myEvals, displayName);

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
	let radar1El;
	let radarWrap1El;

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

	function showTip(items, bench, idx, size, svgEl, wrapEl) {
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
		tooltip1 = {
			visible: true,
			label: items[idx]?.label || 'Kriterium',
			current: Number(items[idx]?.value) || 0,
			benchmark: benchVal,
			x,
			y
		};
	}

	function hideTip() {
		tooltip1 = { ...tooltipDefaults };
	}

	const buildTimeline = (evals) => {
		if (!evals.length) return null;

		const rows = (evals || [])
			.map((ev) => {
				const t = parseTs(ev?.date || ev?.createdAt);
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
				palette[disc?.toLowerCase()] || ['#e11d2f', '#0f1724', '#0ea5e9', '#f59e0b'][idx % 4];
			return { name: disc, color, values };
		});

		return { labels, series };
	};

	$: timeline1 = buildTimeline(myEvals);

	const chartDims = (labels = [], height = 220) => {
		const width = 640;
		const pad = { left: 50, right: 20, top: 10, bottom: 36 };
		const innerW = width - pad.left - pad.right;
		const innerH = height - pad.top - pad.bottom;
		const xPos = (idx) =>
			pad.left + (labels.length > 1 ? (innerW * idx) / Math.max(1, labels.length - 1) : 0);
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

	$: dims1 = chartDims(timeline1?.labels || [], 170);

	const emptyLineTip = { visible: false, x: 0, y: 0, label: '', rows: [] };
	let lineTip1 = { ...emptyLineTip };
	let lineWrap1El;
	let lineSvg1El;

	function showLineTip(idx, dims, svgEl, wrapEl) {
		const tl = timeline1;
		if (!tl) return;
		const label = tl.labels?.[idx];
		const rows =
			tl.series?.map((s) => ({
				name: s.name,
				color: s.color,
				value: s.values?.[idx] ?? '-'
			})) || [];
		const numericVals = rows
			.map((r) => (typeof r.value === 'number' ? r.value : null))
			.filter((v) => v != null);
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
		lineTip1 = {
			visible: true,
			x,
			y,
			label: formatMonth(label),
			rows
		};
	}

	function hideLineTip() {
		lineTip1 = { ...emptyLineTip };
	}
</script>

<div class="app-shell">
	<NavBar role="athlete" active="analyse" />

	<main class="page container">
		<header class="page-header">
			<h1>Performance Analyse</h1>
			<p class="muted">Kompetenzprofil und Entwicklung über Zeit</p>
		</header>

		<section class="chart-grid grid-single">
			<div class="card chart fly-in-card">
				<div class="chart-header with-score">
					<span>Kompetenzprofil {stats1.name || '-'}</span>
					<span class="score-tag">{stats1.current !== '-' ? `${stats1.current} Punkte` : '-'}</span>
				</div>
				{#if stats1.details && stats1.details.length}
					{#key selectedAthlete}
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
									on:mouseenter={() => showTip(stats1.details, stats1.bench, idx, 360, radar1El, radarWrap1El)}
									on:mouseleave={() => hideTip()}
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
		</section>

		<section class="line-charts grid-single">
			<div class="card line-card fly-in-line">
				<div class="chart-header">Entwicklung über Zeit {stats1.name || ''}</div>
				{#if timeline1}
					{#key selectedAthlete}
					<div class="line-chart" bind:this={lineWrap1El}>
						<svg bind:this={lineSvg1El} viewBox={`0 0 ${dims1.width} ${dims1.height}`} preserveAspectRatio="xMidYMid meet" on:mouseleave={() => hideLineTip()}>
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
											on:mouseenter={() => showLineTip(idx, dims1, lineSvg1El, lineWrap1El)}
											on:mouseleave={() => hideLineTip()}
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
									on:mouseenter={() => showLineTip(idx, dims1, lineSvg1El, lineWrap1El)}
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
							<div class="line-tooltip" style={`left:${lineTip1.x}px; top:${lineTip1.y}px;`}>
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
		</section>
	</main>
</div>

<style>
	:global(body){background:#f7f8fb;}
	.page.container{max-width:1200px;margin:24px auto;padding:0 20px}
	.page-header h1{margin:0;font-size:28px;font-weight:700}
	.page-header .muted{margin:4px 0 0;color:#6b7280;font-size:14px}

	.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
	.chart-grid.grid-single{grid-template-columns:1fr}
	.chart{padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 16px rgba(15,23,36,0.05)}
	.chart.fly-in-card{
		opacity:0;
		transform:translateY(18px);
		animation:chartFlyIn 560ms ease forwards;
		animation-delay:140ms;
	}
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
	.line-card.fly-in-line{
		opacity:0;
		transform:translateY(18px);
		animation:lineCardFlyIn 560ms ease forwards;
		animation-delay:220ms;
	}
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

	@keyframes chartFlyIn{
		from{opacity:0;transform:translateY(18px)}
		to{opacity:1;transform:translateY(0)}
	}

	@keyframes lineCardFlyIn{
		from{opacity:0;transform:translateY(18px)}
		to{opacity:1;transform:translateY(0)}
	}

	@media (prefers-reduced-motion: reduce){
		.radar-animate,
		.line-path,
		.line-point,
		.chart.fly-in-card,
		.line-card.fly-in-line{
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
</style>
