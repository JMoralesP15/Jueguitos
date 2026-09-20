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
      const activeUser = user ?? (await supabase.auth.signInAnonymously()).data.user;

      if (active && activeUser) {
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
