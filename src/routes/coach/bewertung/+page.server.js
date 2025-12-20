import { error } from '@sveltejs/kit';

const DEFAULT_COACH_NAME = 'Daniel';

export async function load({ fetch, cookies }) {
	const cookieCoach = cookies.get('coachName');
	const coachName = (cookieCoach || DEFAULT_COACH_NAME).trim() || DEFAULT_COACH_NAME;
	const res = await fetch('/api/athletes');
	if (!res.ok) throw error(res.status, 'Konnte Athleten nicht laden');
	const athletes = await res.json();
	return { athletes, coachName };
}
