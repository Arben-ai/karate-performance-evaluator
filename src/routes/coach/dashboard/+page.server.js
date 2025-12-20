import { error } from '@sveltejs/kit';

const DEFAULT_COACH_NAME = 'Daniel';

async function fetchJson(fetch, path, label) {
	const res = await fetch(path, { cache: 'no-store' });
	if (!res.ok) {
		throw error(res.status, `Konnte ${label} nicht laden`);
	}
	return res.json();
}

export async function load({ fetch, cookies }) {
	const cookieCoach = cookies.get('coachName');
	const coachName = (cookieCoach || DEFAULT_COACH_NAME).trim() || DEFAULT_COACH_NAME;
	const coachQuery = encodeURIComponent(coachName);
	const athletes = await fetchJson(fetch, `/api/athletes?coach=${coachQuery}`, 'Athleten');
	const allAthletes = await fetchJson(fetch, `/api/athletes`, 'Athleten Gesamt');
	const evaluations = await fetchJson(fetch, `/api/evaluations?coach=${coachQuery}`, 'Bewertungen');

	return {
		coachName,
		athletes,
		allAthletes,
		evaluations
	};
}
