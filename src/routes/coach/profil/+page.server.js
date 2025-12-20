import { error } from '@sveltejs/kit';

const DEFAULT_COACH_NAME = 'Daniel';

async function fetchJson(fetch, path, label) {
	const res = await fetch(path);
	if (!res.ok) {
		throw error(res.status, `Konnte ${label} nicht laden`);
	}
	return res.json();
}

export async function load({ fetch, cookies }) {
	const cookieCoach = cookies.get('coachName');
	const coachName = (cookieCoach || DEFAULT_COACH_NAME).trim() || DEFAULT_COACH_NAME;
	const coachQuery = encodeURIComponent(coachName);
	const coachAthletes = await fetchJson(fetch, `/api/athletes?coach=${coachQuery}`, 'Athleten');
	return { coachName, coachAthletes };
}
