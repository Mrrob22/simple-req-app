import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'staff' | 'researcher' | 'user';
export const ROLES = ['admin','staff','researcher','user'] as const;

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, index: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'user' },

    exhibitsCount: { type: String, default: '0' },
    commentsCount: { type: String, default: '0' },
    notificationsCount: { type: String, default: '0' },

    isActive: { type: Boolean, default: true },
    emailVerified: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    const doc = this as any;
    if (!doc.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(plain: string) {
    return bcrypt.compare(plain, this.password);
};

export const User = models.User || model('User', UserSchema);
