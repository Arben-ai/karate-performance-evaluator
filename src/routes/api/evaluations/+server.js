import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const normalize = (v) => (v || '').toString().trim();

function formatDate(value) {
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('de-CH');
  } catch {
    /* ignore */
  }
  return value || '';
}

const mapDoc = (doc = {}) => {
  const id = doc._id ? doc._id.toString() : doc.id;
  const date = formatDate(doc.date || doc.createdAt);
  const base = { ...doc, id, date };
  delete base._id;
  return base;
};

export async function GET({ url }) {
  try {
    const coach = url.searchParams.get('coach')?.trim();
    const filter = coach ? { coach: { $regex: `^${escapeRegex(coach)}$`, $options: 'i' } } : {};

    const db = await getDb();
    const list = await db.collection('evaluations').find(filter).sort({ date: -1 }).limit(1000).toArray();
    return json(list.map(mapDoc));
  } catch (e) {
    console.error(e);
    throw error(500, 'DB read failed');
  }
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const { athlete, discipline, coach, score, comment, details, badge, badgeTone, date } = payload || {};

    const cleanAthlete = normalize(athlete);
    const cleanDiscipline = normalize(discipline);
    const cleanCoach = normalize(coach) || 'Coach';
    const cleanDate = date || new Date().toISOString();

    if (!cleanAthlete || !cleanDiscipline) {
      throw error(400, 'athlete und discipline sind Pflichtfelder');
    }

    const now = new Date();
    const doc = {
      athlete: cleanAthlete,
      discipline: cleanDiscipline,
      coach: cleanCoach,
      score: typeof score === 'number' ? score : null,
      comment: comment || '',
      text: comment || '',
      badge:
        typeof badge === 'string'
          ? badge
          : score >= 80
            ? 'Sehr gut'
            : score >= 60
              ? 'Gut'
              : score >= 40
                ? 'Genügend'
                : 'Ungenügend',
      badgeTone:
        typeof badgeTone === 'string'
          ? badgeTone
          : score >= 80
            ? 'green'
            : score >= 60
              ? 'blue'
              : score >= 40
                ? 'yellow'
                : 'red',
      details: Array.isArray(details) ? details : [],
      date: cleanDate || now.toISOString(),
      createdAt: now.toISOString()
    };

    const db = await getDb();
    const res = await db.collection('evaluations').insertOne(doc);
    const saved = mapDoc({ ...doc, _id: res.insertedId });
    return json(saved, { status: 201 });
  } catch (e) {
    console.error(e);
    if (e.status) throw e;
    throw error(500, 'DB write failed');
  }
}

export async function DELETE({ url }) {
  try {
    const id = url.searchParams.get('id');
    const athlete = normalize(url.searchParams.get('athlete'));
    const deleteAll = url.searchParams.get('all') === 'true';
    const db = await getDb();

    if (!id && !athlete && !deleteAll) {
      throw error(400, 'id, athlete oder all=true ist erforderlich');
    }

    if (deleteAll) {
      const res = await db.collection('evaluations').deleteMany({});
      return json({ ok: true, deletedCount: res.deletedCount });
    }

    if (id) {
      const res = await db.collection('evaluations').deleteOne({ _id: new ObjectId(id) });
      if (res.deletedCount === 0) throw error(404, 'Bewertung nicht gefunden');
      return json({ ok: true, deletedCount: res.deletedCount });
    }

    const res = await db
      .collection('evaluations')
      .deleteMany({ athlete: { $regex: `^${escapeRegex(athlete)}$`, $options: 'i' } });
    return json({ ok: true, deletedCount: res.deletedCount });
  } catch (e) {
    console.error(e);
    if (e.status) throw e;
    throw error(500, 'DB delete failed');
  }
}
