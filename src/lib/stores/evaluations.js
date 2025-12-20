import { writable } from 'svelte/store';

export const formatDate = (value) => {
	try {
		const d = new Date(value);
		if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('de-CH');
	} catch {
		/* ignore */
	}
	return value || '';
};

export const normalizeEval = (doc = {}) => {
	const id = doc._id ? doc._id.toString() : doc.id || crypto.randomUUID();
	const date = formatDate(doc.date || doc.createdAt);
	const name =
		doc.name ||
		[
			(doc.athlete || '').toString().trim(),
			(doc.discipline || '').toString().trim()
		]
			.filter(Boolean)
			.join(' - ');
	const badge =
		doc.badge ||
		(Number(doc.score) >= 80
			? 'Sehr gut'
			: Number(doc.score) >= 60
				? 'Gut'
				: Number(doc.score) >= 40
					? 'Genügend'
					: 'Ungenügend');
	const badgeTone =
		doc.badgeTone ||
		(Number(doc.score) >= 80
			? 'green'
			: Number(doc.score) >= 60
				? 'blue'
				: Number(doc.score) >= 40
					? 'yellow'
					: 'red');
	const clean = { ...doc, id, date, badge, badgeTone, name };
	delete clean._id;
	return clean;
};

function createStore() {
	const initial =
		typeof localStorage !== 'undefined'
			? JSON.parse(localStorage.getItem('evaluations') || '[]')
			: [];

	const store = writable(initial);

	async function loadFromApi() {
		if (typeof fetch === 'undefined') return;
		try {
			const res = await fetch('/api/evaluations');
			if (!res.ok) return;
			const list = await res.json();
			const normalized = Array.isArray(list) ? list.map(normalizeEval) : [];
			store.set(normalized);
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('evaluations', JSON.stringify(normalized));
			}
		} catch (e) {
			console.warn('evaluations fetch failed', e);
		}
	}

	if (typeof window !== 'undefined') {
		loadFromApi();
	}

	if (typeof localStorage !== 'undefined') {
		store.subscribe((val) => {
			try {
				localStorage.setItem('evaluations', JSON.stringify(val));
			} catch (e) {
				/* ignore persistence errors */
			}
		});
	}

	async function addEvaluation(entry) {
		const payload = { ...entry };
		try {
			const res = await fetch('/api/evaluations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (res.ok) {
				const saved = normalizeEval(await res.json());
				store.update((list) => [saved, ...list]);
				return saved;
			}
		} catch (e) {
			console.warn('evaluation save failed', e);
		}
		// Fallback optimistic update if API not reachable
		const fallback = normalizeEval(payload);
		store.update((list) => [fallback, ...list]);
		return fallback;
	}

	async function removeEvaluation(id) {
		if (!id) return;
		store.update((list) => list.filter((ev) => ev?.id !== id));
		try {
			await fetch(`/api/evaluations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
		} catch (e) {
			console.warn('evaluation delete failed', e);
		}
	}

	async function removeByAthlete(name) {
		if (!name) return;
		const norm = (v) => (v || '').toString().trim().toLowerCase();
		store.update((list) => list.filter((ev) => norm(ev?.athlete) !== norm(name)));
		try {
			await fetch(`/api/evaluations?athlete=${encodeURIComponent(name)}`, { method: 'DELETE' });
		} catch (e) {
			console.warn('evaluation bulk delete failed', e);
		}
	}

	async function removeAll() {
		store.set([]);
		try {
			await fetch('/api/evaluations?all=true', { method: 'DELETE' });
		} catch (e) {
			console.warn('evaluation delete all failed', e);
		}
	}

	return { subscribe: store.subscribe, addEvaluation, removeEvaluation, removeByAthlete, removeAll, loadFromApi };
}

export const evaluations = createStore();
