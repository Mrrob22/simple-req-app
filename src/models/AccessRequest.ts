import { Schema, model, models } from 'mongoose';

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type RequestedRole = 'user' | 'researcher';

const AccessRequestSchema = new Schema({
    fullName: { type: String, required: true },
    email:    { type: String, required: true, index: true },
    phone:    { type: String },
    about:    { type: String },
    agreed:   { type: Boolean, required: true },

    roleRequested: { type: String, enum: ['user', 'researcher'], required: true },

    passport: {
        series: String,
        number: String,
        issuedBy: String,
        issuedAt: String,
    },
    directorLetterUrl: { type: String },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: String },
    reviewComment: { type: String },

    createdUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const AccessRequest = models.AccessRequest || model('AccessRequest', AccessRequestSchema);
