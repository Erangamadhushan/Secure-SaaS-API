import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
}

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

export const isAccountLocked = (user) => {
    if (user.isLocked) {
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return true; // Account is still locked
        }
    }
}