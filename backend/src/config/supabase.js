// backend/src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Buckets separados (CORRETO!)
export const BUCKET_ONIBUS = process.env.SUPABASE_BUCKET_ONIBUS || "onibus";
export const BUCKET_MOTORISTAS = process.env.SUPABASE_BUCKET_MOTORISTAS || "motoristas";
