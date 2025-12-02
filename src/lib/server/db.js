import { MONGODB_URI, MONGODB_DB } from "$env/static/private";
import { MongoClient } from "mongodb";

const uri = MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI fehlt in der .env Datei");

let client;
let clientPromise;

if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDb(name = MONGODB_DB || "kpe") {
    const c = await clientPromise;
    return c.db(name);
}
