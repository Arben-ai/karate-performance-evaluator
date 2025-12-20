import { error } from '@sveltejs/kit';

async function fetchJson(fetch, path, label) {
	const res = await fetch(path);
	if (!res.ok) {
		throw error(res.status, `Konnte ${label} nicht laden`);
	}
	return res.json();
}

export async function load({ fetch }) {
	try {
		const [athletes, evaluations] = await Promise.all([
			fetchJson(fetch, '/api/athletes', 'Athleten'),
			fetchJson(fetch, '/api/evaluations', 'Bewertungen')
		]);

		return { athletes, evaluations };
	} catch (e) {
		console.warn('athlete layout load failed', e);
		return { athletes: [], evaluations: [] };
	}
}

