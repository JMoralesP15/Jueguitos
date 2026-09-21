import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { DuelGame } from "./duel-game";

export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ingresar?next=/jugar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <DuelGame showIntroduction={!profile?.onboarding_completed} />
      <nav className="game-nav" aria-label="Navegación del juego">
        <Link href="/ranking">Ver ranking</Link>
        <Link href="/aportes/nuevo">Aportar un local</Link>
      </nav>
    </>
  );
}
