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
		const normalized = list.map((doc) => ({
			...doc,
			_id: doc?._id?.toString?.() ?? doc?._id
		}));
		return json(normalized);
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
		const insertedId = res?.insertedId?.toString?.() ?? res?.insertedId;
		return json({ insertedId, ...doc, _id: insertedId }, { status: 201 });
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
		const idQuery = ObjectId.isValid(id)
			? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
			: { _id: id };
		const res = await db.collection('athletes').deleteOne(idQuery);
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
		const { id, athlete, discipline, coach, gender, age, rank, email, previousAthlete } = payload || {};
		const cleanId = (id ?? '').toString().trim();
		if (!cleanId) throw error(400, 'id ist erforderlich');

		const cleanAthlete = (athlete ?? '').toString().trim();
		const cleanDiscipline = (discipline ?? '').toString().trim();
		const cleanCoach = (coach ?? '').toString().trim();
		const cleanGender = (gender ?? '').toString().trim();
		const cleanRank = (rank ?? '').toString().trim();
		const cleanEmail = (email ?? '').toString().trim();
		const cleanPreviousAthlete = (previousAthlete ?? '').toString().trim();
		const numericAge = Number.isFinite(age) ? age : Number(age);

		if (!cleanAthlete || !cleanDiscipline || !cleanCoach || !cleanGender || !cleanRank) {
			throw error(400, 'athlete, discipline, coach, gender und rank sind Pflichtfelder');
		}
		if (Number.isFinite(numericAge) && numericAge < 0) {
			throw error(400, 'age darf nicht negativ sein');
		}

		const db = await getDb();
		const idQuery = ObjectId.isValid(cleanId)
			? { $or: [{ _id: new ObjectId(cleanId) }, { _id: cleanId }] }
			: { _id: cleanId };
		const existing = await db.collection('athletes').findOne(idQuery, {
			projection: { athlete: 1 }
		});
		if (!existing) throw error(404, 'Athlet nicht gefunden');

		const updateRes = await db.collection('athletes').updateOne(idQuery, {
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
		});

		if (!updateRes.matchedCount) throw error(404, 'Athlet nicht gefunden');

		const oldName = (existing?.athlete || '').toString().trim();
		const renameTargets = Array.from(
			new Set([oldName, cleanPreviousAthlete].filter((n) => n && n !== cleanAthlete))
		);
		if (renameTargets.length) {
			await db.collection('evaluations').updateMany(
				{
					$or: renameTargets.map((n) => ({
						athlete: { $regex: `^${escapeRegex(n)}$`, $options: 'i' }
					}))
				},
				{ $set: { athlete: cleanAthlete } }
			);
		}

		const updated = await db.collection('athletes').findOne(idQuery, {
			projection: { athlete: 1, discipline: 1, coach: 1, gender: 1, age: 1, rank: 1, email: 1, createdAt: 1 }
		});
		return json({ ...updated, _id: updated?._id?.toString?.() ?? updated?._id });
	} catch (e) {
		console.error(e);
		if (e.status) throw e;
		throw error(500, 'DB update failed');
	}
}
