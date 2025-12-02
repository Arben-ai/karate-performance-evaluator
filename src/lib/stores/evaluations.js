import { writable } from 'svelte/store';

const seed = [
	{
		id: 'sarah',
		name: 'Sarah Weber – Kata',
		athlete: 'Sarah Weber',
		discipline: 'Kata',
		coach: 'Coach Daniel',
		date: '15.11.2025',
		text: 'Hervorragende Technik, exzellente Präzision. Die Bewegungen sind sehr flüssig und die Kime ist stark ausgeprägt.',
		score: 87,
		badge: 'Exzellent',
		badgeTone: 'green',
		details: [
			{ label: 'Präzision', value: 90 },
			{ label: 'Technik', value: 92 },
			{ label: 'Geschwindigkeit', value: 78 },
			{ label: 'Fokus', value: 88 },
			{ label: 'Ausdruck', value: 85 }
		],
		comment: 'Hervorragende Technik, exzellente Präzision. Die Bewegungen sind sehr flüssig und die Kime ist stark ausgeprägt.'
	},
	{
		id: 'marc',
		name: 'Marc Müller – Kumite',
		athlete: 'Marc Müller',
		discipline: 'Kumite',
		coach: 'Coach Daniel',
		date: '14.11.2025',
		text: 'Gute Fortschritte in der Kampftaktik. Die Distanz muss noch besser kontrolliert werden.',
		score: 82,
		badge: 'Gut',
		badgeTone: 'blue',
		details: [
			{ label: 'Präzision', value: 82 },
			{ label: 'Technik', value: 85 },
			{ label: 'Geschwindigkeit', value: 88 },
			{ label: 'Fokus', value: 80 },
			{ label: 'Ausdruck', value: 78 }
		],
		comment: 'Gute Fortschritte in der Kampftaktik. Die Distanz muss noch besser kontrolliert werden.'
	},
	{
		id: 'anna',
		name: 'Anna Schmidt – Kihon',
		athlete: 'Anna Schmidt',
		discipline: 'Kihon',
		coach: 'Coach Daniel',
		date: '13.11.2025',
		text: 'Ausgezeichnete Grundtechniken. Die Balance ist sehr stabil.',
		score: 90,
		badge: 'Exzellent',
		badgeTone: 'green',
		details: [
			{ label: 'Präzision', value: 92 },
			{ label: 'Technik', value: 90 },
			{ label: 'Geschwindigkeit', value: 85 },
			{ label: 'Fokus', value: 90 },
			{ label: 'Ausdruck', value: 88 }
		],
		comment: 'Ausgezeichnete Grundtechniken. Die Balance ist sehr stabil.'
	}
];

function createStore() {
	const initial =
		typeof localStorage !== 'undefined'
			? JSON.parse(localStorage.getItem('evaluations') || 'null') || seed
			: seed;

	const store = writable(initial);

	if (typeof localStorage !== 'undefined') {
		store.subscribe((val) => {
			try {
				localStorage.setItem('evaluations', JSON.stringify(val));
			} catch (e) {
				/* ignore persistence errors */
			}
		});
	}

	function addEvaluation(entry) {
		store.update((list) => {
			return [entry, ...list];
		});
	}

	return { subscribe: store.subscribe, addEvaluation };
}

export const evaluations = createStore();
