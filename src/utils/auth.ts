// utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);
export const verifyPassword = async (password: string, hash: string) => await bcrypt.compare(password, hash);
export const generateToken = (userId: number) => jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
