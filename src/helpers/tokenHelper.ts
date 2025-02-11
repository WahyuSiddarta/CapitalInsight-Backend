import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "your_secret_key";
const refreshSecretKey =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";

interface CustomJwtPayload extends jwt.JwtPayload {
  id: number;
  email: string;
}

export const verifyToken = (token: string): CustomJwtPayload | null => {
  try {
    return jwt.verify(token, secretKey) as CustomJwtPayload;
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): CustomJwtPayload | null => {
  try {
    return jwt.verify(token, refreshSecretKey) as CustomJwtPayload;
  } catch (err) {
    return null;
  }
};
