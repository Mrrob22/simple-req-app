import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'staff' | 'researcher' | 'user';
export const ROLES = ['admin', 'staff', 'researcher', 'user'] as const;

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;

    exhibitsCount?: string;
    commentsCount?: string;
    notificationsCount?: string;

    isActive?: boolean;
    emailVerified?: Date | null;
    lastLoginAt?: Date | null;

    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
}

export interface IUserMethods {
    comparePassword(plain: string): Promise<boolean>;
}

export type UserModel = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            unique: true,
            index: true,
            required: true,
            lowercase: true,
            trim: true,
        },
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
    },
    { timestamps: true },
);

UserSchema.pre('save', async function (next) {
    const doc = this as HydratedDocument<IUser>;
    if (!doc.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
});

UserSchema.methods.comparePassword = function (plain: string) {
    const doc = this as HydratedDocument<IUser>;
    return bcrypt.compare(plain, doc.password);
};

export const User = (models.User as UserModel) || model<IUser, UserModel>('User', UserSchema);
