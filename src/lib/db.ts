import mongoose, { type Mongoose } from 'mongoose';

declare global {
    // eslint-disable-next-line no-var
    var __mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

const cached = global.__mongoose ??= { conn: null, promise: null as Promise<Mongoose> | null };

export async function dbConnect(): Promise<Mongoose> {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('Missing MONGODB_URI');
        cached.promise = mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
