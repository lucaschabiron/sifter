import { Response, NextFunction } from "express";
import { authSupabase } from "../config/supabase";
import { createSiftSchema, updateSiftSchema } from "../schemas/siftSchemas";
import { z } from "zod";
import { log } from "../utils/logger";
import { Request } from "express-jwt";

export const listSifts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const supabase = authSupabase(token);
    const { data, error } = await supabase
      .from("sifts")
      .select("*")
      .eq("user_id", user)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json(data ?? []);
  } catch (error) {
    log(`Error in listSifts: ${error}`);
    next(error);
  }
};

export const getSift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const siftId = parseInt(req.params.id, 10);

    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (Number.isNaN(siftId)) {
      res.status(400).json({ error: "Invalid sift id" });
      return;
    }

    const supabase = authSupabase(token);
    const { data, error } = await supabase
      .from("sifts")
      .select("*")
      .eq("id", siftId)
      .eq("user_id", user)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.details === "The result contains 0 rows") {
        res.status(404).json({ error: "Sift not found" });
        return;
      }
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    log(`Error in getSift: ${error}`);
    next(error);
  }
};

export const createSift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    log(`createSift payload: ${JSON.stringify(req.body)}`);
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const sift = createSiftSchema.parse(req.body);
    const insertSift = {
      user_id: user,
      title: sift.title,
      topic: sift.topic,
      usual_sources: sift.usualSources,
      frequency: sift.frequency,
      content_preference: sift.contentPreference,
      active: sift.active ?? true,
    };

    const supabase = authSupabase(token);
    const { data, error } = await supabase
      .from("sifts")
      .insert([insertSift])
      .select()
      .single();

    if (error) {
      log(`Supabase error on create: ${JSON.stringify(error)}`);
      throw new Error(error.message || JSON.stringify(error));
    }

    log(`createSift success: ${JSON.stringify(data)}`);
    res.status(201).json(data);
  } catch (error) {
    log(`Error in createSift: ${error}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    next(error);
  }
};

export const updateSift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const siftId = parseInt(req.params.id, 10);

    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (Number.isNaN(siftId)) {
      res.status(400).json({ error: "Invalid sift id" });
      return;
    }

    const sift = updateSiftSchema.parse(req.body);
    const supabase = authSupabase(token);

    const { data, error } = await supabase
      .from("sifts")
      .update({
        title: sift.title,
        topic: sift.topic,
        usual_sources: sift.usualSources,
        frequency: sift.frequency,
        content_preference: sift.contentPreference,
        active: sift.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", siftId)
      .eq("user_id", user)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.details === "The result contains 0 rows") {
        res.status(404).json({ error: "Sift not found" });
        return;
      }
      throw new Error(error.message);
    }

    res.json(data);
  } catch (error) {
    log(`Error in updateSift: ${error}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    next(error);
  }
};

export const deleteSift = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const siftId = parseInt(req.params.id, 10);

    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (Number.isNaN(siftId)) {
      res.status(400).json({ error: "Invalid sift id" });
      return;
    }

    const supabase = authSupabase(token);
    const { error } = await supabase
      .from("sifts")
      .delete()
      .eq("id", siftId)
      .eq("user_id", user);

    if (error) {
      throw new Error(error.message);
    }

    res.status(204).send();
  } catch (error) {
    log(`Error in deleteSift: ${error}`);
    next(error);
  }
};
