import jwt from 'jsonwebtoken';

const ACCESS_TTL = '15m';
const REFRESH_TTL = '30d';

export function signAccessToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_TTL });
}
export function signRefreshToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL });
}
export function verifyAccess(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
}
export function verifyRefresh(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
}
