import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generate_token = async (payload) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      expiresIn: process.env.JWT_EXPIRY_IN_DAYS,
      algorithm: "HS256",
    });
    return token;
  } catch (error) {
    console.log("Error during create JWT token:", error);
  }
};

export const verify_token = async (token) => {
  try {
    const isValid = jwt.verify(token, process.env.JWT_SECRET);
    return isValid;
  } catch (error) {
    console.log("Error during verify JWT token:", error.message);
  }
};
