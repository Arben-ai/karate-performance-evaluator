import { getDb } from "$lib/server/db";
import { json } from "@sveltejs/kit";

export async function GET() {
    const db = await getDb();
    const list = await db.collection("test").find({}).limit(10).toArray();
    return json(list);
}
