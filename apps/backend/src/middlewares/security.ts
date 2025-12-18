import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://sifter-app.com",
      "https://www.sifter-app.com",
      "http://localhost:3000", // Development
      "http://localhost:3001", // Alternative dev port
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Request logging
export const requestLogger = morgan("combined", {
  skip: (req: Request) => {
    // Skip logging for health checks
    return req.url === "/health";
  },
});

// Request size limiter middleware
export const requestSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.headers["content-length"] || "0");

  if (contentLength > maxSize) {
    res.status(413).json({
      error: "Request entity too large",
      maxSize: "10MB",
    });
    return;
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeValue = (value: any): any => {
    if (typeof value === "string") {
      // Remove HTML tags and script tags
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
        .trim();
    }
    if (typeof value === "object" && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  // Only sanitize query and params if they're writable
  try {
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeValue(req.query);
      Object.keys(sanitizedQuery).forEach(key => {
        req.query[key] = sanitizedQuery[key];
      });
    }
  } catch (error) {
    // Query object might be read-only, skip sanitization
  }
  
  try {
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams = sanitizeValue(req.params);
      Object.keys(sanitizedParams).forEach(key => {
        req.params[key] = sanitizedParams[key];
      });
    }
  } catch (error) {
    // Params object might be read-only, skip sanitization
  }

  next();
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    domain: req.get("host"),
    apiUrl:
      process.env.API_URL || `http://localhost:${process.env.PORT || 3333}`,
  });
};
