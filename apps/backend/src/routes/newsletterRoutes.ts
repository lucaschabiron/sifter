import { Router } from "express";
import {
  generateNewsletter,
  validateSources,
  triggerScheduledGeneration,
  getNewsletterStats
} from "../controllers/newsletterController";
import { auth, validateAuth } from "../middlewares/auth";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiting for newsletter generation
const generateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each user to 5 newsletter generations per windowMs
  message: "Too many newsletter generation requests. Please try again later."
});

const validateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each user to 10 source validations per windowMs
  message: "Too many source validation requests. Please try again later."
});

// Newsletter generation
router.post("/generate", generateLimit, auth, validateAuth, generateNewsletter);

// Source validation
router.post("/validate-sources", validateLimit, auth, validateAuth, validateSources);

// Manual trigger for scheduled generation (for testing)
router.post("/trigger", auth, validateAuth, triggerScheduledGeneration);

// Newsletter stats
router.get("/stats", auth, validateAuth, getNewsletterStats);

export default router;