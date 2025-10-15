import { sign, verify, type JwtPayload, type Secret } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as Secret;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

export type JWTPayload = { uid: string; role: string; email: string };

export function signJwt(payload: JWTPayload, expiresInSec = 60 * 60 * 24 * 7) {
    return sign(payload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: expiresInSec,
    });
}

export function verifyJwt<T = JWTPayload>(token: string): T | null {
    try {
        return verify(token, JWT_SECRET) as T;
    } catch {
        return null;
    }
}

export const signAccessToken = (payload: { sub: string; role?: string; email?: string }) =>
    sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: 60 * 15 });

export const signRefreshToken = (payload: { sub: string }) =>
    sign(payload, JWT_REFRESH_SECRET, { algorithm: 'HS256', expiresIn: 60 * 60 * 24 * 30 });

export function verifyRefresh<T = { sub: string }>(token: string): T | null {
    try {
        return verify(token, JWT_REFRESH_SECRET) as T;
    } catch {
        return null;
    }
}
