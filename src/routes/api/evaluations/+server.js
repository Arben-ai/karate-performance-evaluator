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
