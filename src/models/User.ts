import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'researcher' | 'staff' | 'user';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'researcher', 'staff', 'user'], default: 'user' },

    exhibitsCount: { type: String, default: '0' },
    commentsCount: { type: String, default: '0' },
    notificationsCount: { type: String, default: '0' },

    isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    const doc = this as any;
    if (!doc.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
});

export const User = models.User || model('User', UserSchema);
