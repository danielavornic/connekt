import jwt from "jsonwebtoken";
import { User, UserRole } from "../types/user";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN: number = parseInt(process.env.JWT_EXPIRES_IN || "300000");

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const generateToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
