import Link from "next/link";
import { redirect } from "next/navigation";

import { getPublicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

import { DuelGame } from "./duel-game";

export default async function PlayPage() {
  const environment = getPublicEnvironment();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ingresar?next=/jugar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <DuelGame
        displayName={typeof profile?.display_name === "string" ? profile.display_name : null}
        environment={environment}
        showIntroduction={!profile?.onboarding_completed}
        userId={user.id}
      />
      <nav className="game-nav" aria-label="Navegación del juego">
        <Link href="/ranking">Ver ranking</Link>
        <Link href="/cuenta">Mi perfil</Link>
        <Link href="/aportes/nuevo">Aportar un local</Link>
      </nav>
    </>
  );
}
