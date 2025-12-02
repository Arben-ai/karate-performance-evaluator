import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI fehlt in der .env Datei");

let client;
let clientPromise;

if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDb(name = process.env.MONGODB_DB || "kpe") {
    const c = await clientPromise;
    return c.db(name);
}
