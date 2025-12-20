import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';

function escapeRegex(value = '') {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET({ url }) {
	try {
		const coach = url.searchParams.get('coach')?.trim();
		const filter = coach ? { coach: { $regex: `^${escapeRegex(coach)}$`, $options: 'i' } } : {};

		const db = await getDb();
		const list = await db
			.collection('athletes')
			.find(filter, {
				projection: { athlete: 1, discipline: 1, coach: 1, gender: 1, age: 1, rank: 1, email: 1, createdAt: 1 }
			})
			.sort({ createdAt: -1 })
			.limit(100)
			.toArray();
		return json(list);
	} catch (e) {
		console.error(e);
		throw error(500, 'DB read failed');
	}
}

export async function POST({ request }) {
	try {
		const payload = await request.json();
		const { athlete, discipline, coach, gender, age, rank, email } = payload || {};

		const cleanAthlete = (athlete ?? '').toString().trim();
		const cleanDiscipline = (discipline ?? '').toString().trim();
		const cleanCoach = (coach ?? '').toString().trim();
		const cleanGender = (gender ?? '').toString().trim();
		const cleanRank = (rank ?? '').toString().trim();
		const cleanEmail = (email ?? '').toString().trim();
		const numericAge = Number.isFinite(age) ? age : Number(age);

		if (!cleanAthlete || !cleanDiscipline || !cleanCoach || !cleanGender || !cleanRank) {
			throw error(400, 'athlete, discipline, coach, gender und rank sind Pflichtfelder');
		}
		if (Number.isFinite(numericAge) && numericAge < 0) {
			throw error(400, 'age darf nicht negativ sein');
		}

		const now = new Date();
		const doc = {
			athlete: cleanAthlete,
			discipline: cleanDiscipline,
			coach: cleanCoach,
			coachNormalized: cleanCoach ? cleanCoach.toLowerCase() : '',
			gender: cleanGender,
			age: Number.isFinite(numericAge) ? numericAge : null,
			rank: cleanRank,
			email: cleanEmail || null,
			createdAt: now.toISOString()
		};

		const db = await getDb();
		const res = await db.collection('athletes').insertOne(doc);
		return json({ insertedId: res.insertedId, ...doc }, { status: 201 });
	} catch (e) {
		console.error(e);
		if (e.status) throw e;
		throw error(500, 'DB write failed');
	}
}

export async function DELETE({ url }) {
	try {
		const id = url.searchParams.get('id');
		if (!id) throw error(400, 'id ist erforderlich');
		const db = await getDb();
		const res = await db.collection('athletes').deleteOne({ _id: new ObjectId(id) });
		if (res.deletedCount === 0) {
			throw error(404, 'Athlet nicht gefunden');
		}
		return json({ ok: true });
	} catch (e) {
		console.error(e);
		if (e.status) throw e;
		throw error(500, 'DB delete failed');
	}
}

export async function PUT({ request }) {
	try {
		const payload = await request.json();
		const { id, athlete, discipline, coach, gender, age, rank, email } = payload || {};
		const cleanId = (id ?? '').toString().trim();
		if (!cleanId) throw error(400, 'id ist erforderlich');

		const cleanAthlete = (athlete ?? '').toString().trim();
		const cleanDiscipline = (discipline ?? '').toString().trim();
		const cleanCoach = (coach ?? '').toString().trim();
		const cleanGender = (gender ?? '').toString().trim();
		const cleanRank = (rank ?? '').toString().trim();
		const cleanEmail = (email ?? '').toString().trim();
		const numericAge = Number.isFinite(age) ? age : Number(age);

		if (!cleanAthlete || !cleanDiscipline || !cleanCoach || !cleanGender || !cleanRank) {
			throw error(400, 'athlete, discipline, coach, gender und rank sind Pflichtfelder');
		}
		if (Number.isFinite(numericAge) && numericAge < 0) {
			throw error(400, 'age darf nicht negativ sein');
		}

		const db = await getDb();
		const res = await db
			.collection('athletes')
			.findOneAndUpdate(
				{ _id: new ObjectId(cleanId) },
				{
					$set: {
						athlete: cleanAthlete,
						discipline: cleanDiscipline,
						coach: cleanCoach,
						coachNormalized: cleanCoach ? cleanCoach.toLowerCase() : '',
						gender: cleanGender,
						age: Number.isFinite(numericAge) ? numericAge : null,
						rank: cleanRank,
						email: cleanEmail || null
					}
				},
				{
					returnDocument: 'after',
					projection: { athlete: 1, discipline: 1, coach: 1, gender: 1, age: 1, rank: 1, email: 1, createdAt: 1 }
				}
			);

		if (!res.value) throw error(404, 'Athlet nicht gefunden');
		return json(res.value);
	} catch (e) {
		console.error(e);
		if (e.status) throw e;
		throw error(500, 'DB update failed');
	}
}
