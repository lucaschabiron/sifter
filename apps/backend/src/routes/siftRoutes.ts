import { Router } from "express";
import {
  createSift,
  deleteSift,
  getSift,
  listSifts,
  updateSift,
} from "../controllers/siftController";
import { auth, validateAuth } from "../middlewares/auth";
import { authRateLimiter } from "../middlewares/security";

const router = Router();

router.get("/", auth, validateAuth, listSifts);
router.get("/:id", auth, validateAuth, getSift);
router.post("/create", authRateLimiter, auth, validateAuth, createSift);
router.put("/:id", authRateLimiter, auth, validateAuth, updateSift);
router.delete("/:id", authRateLimiter, auth, validateAuth, deleteSift);

export default router;
