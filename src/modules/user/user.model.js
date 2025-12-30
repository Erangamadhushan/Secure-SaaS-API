import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        select: false,
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

export default mongoose.model('User', userSchema);