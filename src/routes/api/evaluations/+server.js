import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export async function GET() {
  try {
    const db = await getDb();
    const list = await db.collection('evaluations').find({}).sort({ date: -1 }).limit(50).toArray();
    return json(list);
  } catch (e) {
    console.error(e);
    throw error(500, 'DB read failed');
  }
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const { athlete, discipline, coach, score, comment, details } = payload || {};

    if (!athlete || !discipline) {
      throw error(400, 'athlete und discipline sind Pflichtfelder');
    }

    const now = new Date();
    const doc = {
      athlete,
      discipline,
      coach: coach || 'Coach',
      score: typeof score === 'number' ? score : null,
      comment: comment || '',
      text: comment || '',
      badge: score >= 90 ? 'Exzellent' : score >= 80 ? 'Gut' : 'OK',
      badgeTone: score >= 90 ? 'green' : 'blue',
      details: Array.isArray(details) ? details : [],
      date: now.toISOString()
    };

    const db = await getDb();
    const res = await db.collection('evaluations').insertOne(doc);
    return json({ insertedId: res.insertedId, ...doc }, { status: 201 });
  } catch (e) {
    console.error(e);
    if (e.status) throw e;
    throw error(500, 'DB write failed');
  }
}
