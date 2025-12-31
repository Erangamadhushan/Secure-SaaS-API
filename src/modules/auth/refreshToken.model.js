import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7*24*60*60*1000) // 7 days from now
    }
}, { timestamps: true });

// Create TTL index to auto-delete expired tokens
refreshTokenSchema.index({
    expiresAt: 1 // TTL index to auto-delete expired tokens
}, { expireAfterSeconds: 0 // Mongoose will handle expiration based on expiresAt field
 });

export default mongoose.model('RefreshToken', refreshTokenSchema);