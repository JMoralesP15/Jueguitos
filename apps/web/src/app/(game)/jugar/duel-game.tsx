"use client";

import { castDuelVoteSchema, duelPayloadSchema, type BusinessItem, type DuelPayload } from "@mvp/domain";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type GameStatus = "loading" | "ready" | "voting" | "empty" | "error";

function itemLabel(item: BusinessItem) {
  return `${item.category} · ${item.city}`;
}

export function DuelGame() {
  const supabase = useMemo(() => createClient(), []);
  const [duel, setDuel] = useState<DuelPayload | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<GameStatus>("loading");

  const loadNextDuel = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    const { data, error } = await supabase.rpc("create_next_duel");
    const parsed = duelPayloadSchema.safeParse(data?.[0]);

    if (error || !parsed.success) {
      setDuel(null);
      setStatus(error?.message.includes("not enough unseen items") ? "empty" : "error");
      setMessage(
        error?.message.includes("not enough unseen items")
          ? "Necesitamos sumar más locales para continuar el juego."
          : "No pudimos preparar un duelo. Inténtalo nuevamente.",
      );
      return;
    }

    setDuel(parsed.data);
    setStatus("ready");
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function startGame() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          if (active) {
            setStatus("error");
            setMessage("El acceso anónimo aún no está activo. Estamos preparando el juego.");
          }
          return;
        }
      }

      if (active) {
        await loadNextDuel();
      }
    }

    void startGame();
    return () => {
      active = false;
    };
  }, [loadNextDuel, supabase]);

  async function castVote(winnerId: string) {
    if (!duel || status !== "ready") {
      return;
    }

    const vote = castDuelVoteSchema.safeParse({ duelId: duel.duel_id, winnerId });
    if (!vote.success) {
      setStatus("error");
      setMessage("No pudimos validar tu selección.");
      return;
    }

    setStatus("voting");
    const { error } = await supabase.rpc("cast_duel_vote", {
      p_duel_id: vote.data.duelId,
      p_winner_id: vote.data.winnerId,
    });

    if (error) {
      setStatus("error");
      setMessage("Ese duelo ya no está disponible. Prepara uno nuevo.");
      return;
    }

    await loadNextDuel();
  }

  return (
    <main className="game-page">
      <section className="game-header" aria-labelledby="game-title">
        <p className="eyebrow">Descubrir · MVP-003a</p>
        <h1 id="game-title">¿Cuál tiene mejor nombre?</h1>
        <p className="lede">Elige el local que te parezca más memorable. No necesitas crear una cuenta para jugar.</p>
      </section>

      {status === "ready" || status === "voting" ? (
        <section className="duel-grid" aria-label="Elige una de las dos opciones">
          {[duel?.first_item, duel?.second_item].map((item) =>
            item ? (
              <button className="duel-card" disabled={status === "voting"} key={item.id} onClick={() => castVote(item.id)} type="button">
                <img alt={`Local ${item.name}`} className="duel-image" src={item.imageUrl} />
                <span className="duel-name">{item.name}</span>
                <span className="duel-meta">{itemLabel(item)}</span>
              </button>
            ) : null,
          )}
        </section>
      ) : (
        <section className="game-status" aria-live="polite">
          <p>{status === "loading" ? "Preparando el siguiente duelo…" : message}</p>
          {status === "error" || status === "empty" ? (
            <button className="button" onClick={() => void loadNextDuel()} type="button">
              Reintentar
            </button>
          ) : null}
        </section>
      )}
    </main>
  );
}
