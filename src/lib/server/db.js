import { env } from "$env/dynamic/private";
import { MongoClient } from "mongodb";

const uri = env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI fehlt in den Environment Variables");

let client;
let clientPromise;

if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDb(name = env.MONGODB_DB || "kpe") {
    const c = await clientPromise;
    return c.db(name);
}
