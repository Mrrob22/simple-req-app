import { z } from 'zod';

export const baseRequestSchema = z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(7).optional().or(z.literal('')),
    about: z.string().optional(),
    agreed: z.literal(true),
});

export const typeSchema = z.object({
    roleRequested: z.enum(['user', 'researcher']),
});

export const researcherSchema = z.object({
    passport: z.object({
        series: z.string().optional(),
        number: z.string().optional(),
        issuedBy: z.string().optional(),
        issuedAt: z.string().optional(),
    }).optional(),
    directorLetterUrl: z.string().url().optional(),
});
