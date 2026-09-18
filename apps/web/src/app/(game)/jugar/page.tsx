import Link from "next/link";

import { DuelGame } from "./duel-game";

export default function PlayPage() {
  return (
    <>
      <DuelGame />
      <nav className="game-nav" aria-label="Navegación del juego">
        <Link href="/ranking">Ver ranking</Link>
        <Link href="/registro">Crear cuenta para aportar</Link>
      </nav>
    </>
  );
}
