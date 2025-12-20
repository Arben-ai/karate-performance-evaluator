export async function load({ fetch }) {
	try {
		const res = await fetch('/api/athletes');
		if (!res.ok) {
			throw new Error(`Konnte Athleten nicht laden (Status ${res.status})`);
		}
		const athletes = await res.json();
		return { athletes };
	} catch (e) {
		console.warn('Landing load failed', e);
		return { athletes: [] };
	}
}
