import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
	const res = await fetch('/api/evaluations');
	if (!res.ok) throw error(res.status, 'Konnte Bewertungen nicht laden');
	const evaluations = await res.json();
	return { evaluations };
}
