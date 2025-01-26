import jwt, { JsonWebTokenError, Secret } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { DecodedJWT } from "../types/JWT";

dotenv.config();

const secret: Secret = process.env.JWT_SECRET;

export const decodeJWT = (token: string) => {
  try {
    return jwt.verify(token, secret) as DecodedJWT;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new Error("Invalid or malformed token");
    }
    throw error; // Re-throw other unexpected errors
  }
};

export const generateVerificationToken = (
  data: Record<string, any>,
  expire: string | number = "7d"
) => {
  const verificationToken = jwt.sign(data, secret, {
    expiresIn: "7d",
  });

  return verificationToken;
};

export const generateUserToken = (
  id: string,
  data?: { [key: string]: string }
) => {
  let temp: { [key: string]: string } = { _id: id };

  if (data) {
    temp = { ...temp, ...data };
  }

  const verificationToken = jwt.sign(temp, secret, {
    issuer: "FMCToken",
    expiresIn: "30d",
  });

  return verificationToken;
};

export const getTokenJWT = (sessionToken: string) => {
  const token = sessionToken.split(" ")[1];
  const decodedToken = decodeJWT(token);

  return decodedToken;
};
