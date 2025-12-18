import express from "express";
import siftRoutes from "./routes/siftRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import errorHandler from "./middlewares/errorHandler";
import {
  rateLimiter,
  corsOptions,
  securityHeaders,
  requestLogger,
  requestSizeLimiter,
  sanitizeInput,
  healthCheck,
} from "./middlewares/security";
import cors from "cors";

const app = express();

// Security middleware (order matters!)
app.use(securityHeaders); // Security headers first
app.use(requestLogger); // Request logging
app.use(cors(corsOptions)); // CORS configuration
app.use(rateLimiter); // Rate limiting
app.use(requestSizeLimiter); // Request size limiting

// Body parsing middleware
app.use(express.json({ limit: "10mb" })); // Set JSON payload limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization
app.use(sanitizeInput);

// Health check endpoint (before auth required routes)
app.get("/health", healthCheck);

// API routes
app.use("/api/sifts", siftRoutes);
app.use("/api/newsletters", newsletterRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
