"use client";

import { useEffect, useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

export function RankingViewTracker() {
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function recordView() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active && user) {
        await supabase.rpc("record_ranking_view");
      }
    }

    void recordView();
    return () => {
      active = false;
    };
  }, [supabase]);

  return null;
}
