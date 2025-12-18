import { expressjwt } from "express-jwt";
import { Request, Response, NextFunction } from "express";
import { Request as JWTRequest } from "express-jwt";
import dotenv from "dotenv";
import { log } from "../utils/logger";

dotenv.config();

export const auth = expressjwt({
  secret: `${process.env.JWT_SECRET}`,
  algorithms: ["HS256"],
  credentialsRequired: true,
  getToken: (req: Request) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7); // Remove 'Bearer ' prefix
    }
    return undefined;
  },
});

// Additional auth validation middleware
export const validateAuth = (
  req: JWTRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user info is present after JWT validation
    if (!req.auth || !req.auth.sub) {
      log(`Authentication failed: Missing user info`);
      res.status(401).json({ error: "Invalid authentication" });
      return;
    }

    // Log successful authentication (without sensitive data)
    log(`User authenticated: ${req.auth.sub}`);
    next();
  } catch (error) {
    log(`Auth validation error: ${error}`);
    res.status(401).json({ error: "Authentication validation failed" });
  }
};
