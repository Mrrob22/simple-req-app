export function assertAdminKey(headers: Headers) {
    const key = headers.get('x-admin-key');
    if (!key || key !== process.env.ADMIN_API_KEY) {
        const e: any = new Error('Unauthorized');
        e.status = 401;
        throw e;
    }
}
