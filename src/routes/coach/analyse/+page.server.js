import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
	const res = await fetch('/api/athletes');
	if (!res.ok) throw error(res.status, 'Konnte Athleten nicht laden');
	const athletes = await res.json();
	return { athletes };
}
