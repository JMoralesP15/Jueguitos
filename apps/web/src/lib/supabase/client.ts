"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { PublicEnvironment } from "@/lib/env";

export function createClient(environment: PublicEnvironment) {
  return createBrowserClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
