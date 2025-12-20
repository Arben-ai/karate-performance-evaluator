#!/usr/bin/env node
/**
 * Seed evaluations for all athletes:
 * - 5 Bewertungen pro Athlet (je eine pro Jahr, letzte 5 Jahre)
 * - Schreibt in MongoDB-Collection "evaluations"
 *
 * Aufruf:
 *   MONGODB_URI="mongodb+srv://..." DB_NAME="kpe" node scripts/seedEvaluations.js
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'kpe';

if (!uri) {
	console.error('Bitte MONGODB_URI setzen.');
	process.exit(1);
}

const client = new MongoClient(uri);

const commentPool = [
	'Gute Fortschritte, aber Timing weiter schärfen.',
	'Stabile Leistung, Fokus auf Präzision halten.',
	'Mehr Explosivität und Kime trainieren.',
	'Technik verbessert, Distanzkontrolle ausbauen.',
	'Konstanz hoch, weiter an Geschwindigkeit arbeiten.',
	'Sehr saubere Ausführung, Ausdruck verstärken.',
	'Mehr Kraftausdauer einbauen.',
	'Sprung in der Bewertung, weiter so.',
	'Rückschritt bei Präzision, Basics wiederholen.',
	'Leistung konstant, kleine Details optimieren.'
];

const detailLabels = ['Präzision', 'Technik', 'Geschwindigkeit', 'Fokus', 'Ausdruck'];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

function badgeFor(score) {
	if (score >= 80) return { badge: 'Sehr gut', badgeTone: 'green' };
	if (score >= 60) return { badge: 'Gut', badgeTone: 'blue' };
	if (score >= 40) return { badge: 'Genügend', badgeTone: 'yellow' };
	return { badge: 'Ungenügend', badgeTone: 'red' };
}

function buildDetails(score) {
	return detailLabels.map((label) => {
		const jitter = randInt(-8, 8);
		const base = Math.max(20, Math.min(100, score + jitter));
		return { label, value: base };
	});
}

function buildEvaluationsForAthlete(athleteDoc) {
	const now = new Date();
	const currentYear = now.getFullYear();
	const evals = [];

	// Startscore pro Athlet
	let score = randInt(55, 90);

	for (let i = 0; i < 5; i++) {
		const year = currentYear - i;
		const month = randInt(1, 12) - 1; // 0-based
		const day = randInt(2, 26);
		const date = new Date(Date.UTC(year, month, day, 10, 0, 0));

		// Kleine Schwankung von Jahr zu Jahr
		score = Math.max(20, Math.min(100, score + randInt(-8, 8)));
		const { badge, badgeTone } = badgeFor(score);
		const details = buildDetails(score);

		evals.push({
			athlete: athleteDoc.athlete,
			discipline: athleteDoc.discipline,
			coach: athleteDoc.coach || 'Coach',
			coachNormalized: (athleteDoc.coach || '').toLowerCase(),
			name: `${athleteDoc.athlete} - ${athleteDoc.discipline}`,
			score,
			badge,
			badgeTone,
			text: pick(commentPool),
			comment: pick(commentPool),
			details,
			date: date.toISOString(),
			createdAt: date.toISOString()
		});
	}

	return evals;
}

async function main() {
	await client.connect();
	const db = client.db(dbName);
	const athletes = await db.collection('athletes').find({}).toArray();

	if (!athletes.length) {
		throw new Error('Keine Athleten gefunden. Bitte zuerst Athleten importieren.');
	}

	const bulk = [];
	for (const ath of athletes) {
		const evals = buildEvaluationsForAthlete(ath);
		for (const ev of evals) {
			// Upsert pro Athlet+Jahr, um Duplikate zu vermeiden
			bulk.push({
				updateOne: {
					filter: {
						athlete: ev.athlete,
						discipline: ev.discipline,
						coach: ev.coach,
						date: ev.date
					},
					update: { $set: ev },
					upsert: true
				}
			});
		}
	}

	if (!bulk.length) {
		console.log('Keine Schreiboperationen anstehend.');
		return;
	}

	const res = await db.collection('evaluations').bulkWrite(bulk, { ordered: false });
	console.log(`Fertig. Upserts: ${res.upsertedCount}, Modifiziert: ${res.modifiedCount}`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => client.close());
