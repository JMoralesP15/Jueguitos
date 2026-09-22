import type { SupabaseClient } from "@supabase/supabase-js";

export const productEventNames = [
  "introduction_completed",
  "round_completed",
  "next_round_started",
  "favorite_added",
  "favorite_removed",
  "item_details_opened",
  "external_link_clicked",
  "profile_updated",
] as const;

export type ProductEventName = (typeof productEventNames)[number];

type AnalyticsClient = SupabaseClient;

/**
 * Analytics are best-effort: a tracking failure must never block a vote or
 * make the game feel broken. Events contain no email, name or location data.
 */
export async function trackProductEvent(
  supabase: AnalyticsClient,
  eventName: ProductEventName,
  duelId?: string,
) {
  const { error } = await supabase.rpc("record_product_event", {
    p_event_name: eventName,
    p_duel_id: duelId ?? null,
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.warn("No se pudo registrar el evento del producto", eventName, error.message);
  }
}
