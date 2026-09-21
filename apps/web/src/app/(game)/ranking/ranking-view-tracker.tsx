"use client";

import { useEffect, useState } from "react";

import type { PublicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type RankingViewTrackerProps = {
  environment: PublicEnvironment;
};

export function RankingViewTracker({ environment }: RankingViewTrackerProps) {
  const [supabase] = useState(() => createClient(environment));

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
