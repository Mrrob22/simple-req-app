import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

let cached = (global as any)._mongoose || { conn: null, promise: null };

export async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { dbName: 'access_request' }).then(m => m);
    }
    cached.conn = await cached.promise;
    (global as any)._mongoose = cached;
    return cached.conn;
}
