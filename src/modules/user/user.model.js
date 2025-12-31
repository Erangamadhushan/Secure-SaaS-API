import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false, // Exclude password from query results by default
    },
    role: {
        type: String,
        enum: [ "USER", "ADMIN" ],
        default: "USER"
    },
    isLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create an index on email for faster lookups
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);