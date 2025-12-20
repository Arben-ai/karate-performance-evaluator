export const normalizeName = (v) => (v || '').toString().trim();
export const normalizeKey = (v) => normalizeName(v).toLowerCase();

export const ts = (value) => {
	const t = Date.parse(value || '');
	return Number.isNaN(t) ? 0 : t;
};

export function dedupeEvaluations(list = []) {
	const map = new Map();
	for (const ev of list) {
		const key =
			ev?.id ||
			ev?._id ||
			`${normalizeName(ev?.athlete || ev?.name)}-${normalizeName(ev?.discipline)}-${ev?.date || ev?.createdAt || ''}`;
		if (!map.has(key)) map.set(key, ev);
	}
	return Array.from(map.values());
}

export function buildAthleteOptions(athletes = [], evaluations = []) {
	const options = new Map();

	for (const ath of athletes) {
		const label = normalizeName(ath?.athlete || ath?.name);
		const id = ath?._id ? ath._id.toString() : ath?.id || label || '';
		const key = normalizeKey(id || label);
		if (!key) continue;
		options.set(key, {
			id: id || label,
			label: label || 'Athlet',
			discipline: ath?.discipline || '',
			coach: ath?.coach || '',
			gender: ath?.gender || '',
			age: ath?.age,
			rank: ath?.rank || '',
			email: ath?.email || '',
			source: 'athlete'
		});
	}

	for (const ev of evaluations) {
		const label = normalizeName(ev?.athlete || ev?.name);
		const key = normalizeKey(label);
		if (!label || options.has(key)) continue;
		options.set(key, {
			id: ev?.athleteId || label,
			label,
			discipline: ev?.discipline || '',
			coach: ev?.coach || '',
			source: 'evaluation'
		});
	}

	return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label, 'de'));
}

export function findAthleteOption(options = [], selection = '') {
	if (!selection) return null;
	const norm = normalizeKey(selection);
	return options.find(
		(opt) => opt.id === selection || normalizeKey(opt.id) === norm || normalizeKey(opt.label) === norm
	);
}

export function badgeForScore(score, fallbackBadge, fallbackTone) {
	const s = Number(score);
	if (Number.isFinite(s)) {
		if (s >= 80) return { label: 'Sehr gut', tone: 'green' };
		if (s >= 60) return { label: 'Gut', tone: 'blue' };
		if (s >= 40) return { label: 'Genügend', tone: 'yellow' };
		return { label: 'Ungenügend', tone: 'red' };
	}
	return { label: fallbackBadge || 'Offen', tone: fallbackTone || 'gray' };
}
