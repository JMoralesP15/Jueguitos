"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { PublicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type AuthSessionRedirectProps = {
  environment: PublicEnvironment;
  nextPath: string;
};

export function AuthSessionRedirect({ environment, nextPath }: AuthSessionRedirectProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient(environment));

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace(nextPath);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(nextPath);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [nextPath, router, supabase]);

  return (
    <p className="field-help" role="status">
      Si ya ingresaste en otra pestaña, continuaremos automáticamente.
    </p>
  );
}
