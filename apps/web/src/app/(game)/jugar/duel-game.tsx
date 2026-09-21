"use client";

import {
  castDuelVoteSchema,
  duelPayloadSchema,
  duelVoteResultSchema,
  type BusinessItem,
  type DuelPayload,
  type DuelVoteResult,
} from "@mvp/domain";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type GameStatus = "loading" | "ready" | "voting" | "result" | "empty" | "error";

function itemLabel(item: BusinessItem) {
  return item.city;
}

type DuelGameProps = {
  showIntroduction: boolean;
};

export function DuelGame({ showIntroduction }: DuelGameProps) {
  const supabase = useMemo(() => createClient(), []);
  const [duel, setDuel] = useState<DuelPayload | null>(null);
  const [introductionVisible, setIntroductionVisible] = useState(showIntroduction);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DuelVoteResult | null>(null);
  const [status, setStatus] = useState<GameStatus>("loading");

  const loadNextDuel = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    setResult(null);

    const { data, error } = await supabase.rpc("create_next_duel");
    const parsed = duelPayloadSchema.safeParse(data?.[0]);

    if (error || !parsed.success) {
      setDuel(null);
      setStatus(error?.message.includes("round is complete") ? "empty" : "error");
      setMessage(
        error?.message.includes("round is complete")
          ? "Terminaste esta ronda sin repetir locales. Vuelve más tarde para jugar una nueva."
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
        if (active) {
          setStatus("error");
          setMessage("Tu sesión venció. Vuelve a ingresar desde el enlace de tu correo.");
        }
        return;
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

  async function completeIntroduction() {
    setIntroductionVisible(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    }
  }

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
    const { data, error } = await supabase.rpc("cast_duel_vote", {
      p_duel_id: vote.data.duelId,
      p_winner_id: vote.data.winnerId,
    });

    const parsedResult = duelVoteResultSchema.safeParse(data?.[0]);

    if (error || !parsedResult.success) {
      setStatus("error");
      setMessage("Ese duelo ya no está disponible. Prepara uno nuevo.");
      return;
    }

    setResult(parsedResult.data);
    setStatus("result");
  }

  if (introductionVisible) {
    return (
      <main className="game-page">
        <section className="game-introduction" aria-labelledby="introduction-title">
          <p className="eyebrow">Tu primera ronda</p>
          <h1 id="introduction-title">Elige el nombre que más te guste</h1>
          <p className="lede">
            Verás dos locales reales de Santiago. Toca uno para votar, descubre qué eligió la
            comunidad y continúa mientras te entretenga.
          </p>
          <ul>
            <li>No hay respuestas correctas.</li>
            <li>Cada pareja se vota una sola vez.</li>
            <li>Tu correo nunca aparece en el ranking.</li>
          </ul>
          <button className="button" onClick={() => void completeIntroduction()} type="button">
            Entendido, comenzar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-page">
      <section className="game-header" aria-labelledby="game-title">
        <p className="eyebrow">Descubrir Santiago</p>
        <h1 id="game-title">¿Cuál tiene mejor nombre?</h1>
        <p className="lede">Elige el local que te parezca más memorable.</p>
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
      ) : status === "result" && duel && result ? (
        <section className="duel-result" aria-live="polite" aria-labelledby="result-title">
          <div>
            <p className="eyebrow">Voto registrado</p>
            <h2 id="result-title">Así eligió la comunidad</h2>
          </div>
          <div className="result-grid">
            {[
              {
                item: duel.first_item,
                percentage: result.first_percentage,
                votes: result.first_votes,
              },
              {
                item: duel.second_item,
                percentage: result.second_percentage,
                votes: result.second_votes,
              },
            ].map(({ item, percentage, votes }) => (
              <article className="result-card" key={item.id}>
                <img alt={`Local ${item.name}`} className="duel-image" src={item.imageUrl} />
                <div className="result-card-content">
                  <span className="duel-name">{item.name}</span>
                  <span className="duel-meta">{itemLabel(item)}</span>
                  <strong>{percentage}%</strong>
                  <div
                    aria-label={`${percentage}% de preferencia`}
                    className="result-bar"
                    role="progressbar"
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={percentage}
                  >
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <small>
                    {votes} {votes === 1 ? "voto" : "votos"}
                  </small>
                </div>
              </article>
            ))}
          </div>
          <button className="button" onClick={() => void loadNextDuel()} type="button">
            Siguiente duelo
          </button>
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
