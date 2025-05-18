import jwt from "jsonwebtoken";
import ms from "ms";
import { User, UserRole } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5m";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const generateToken = (user: User): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as ms.StringValue,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
