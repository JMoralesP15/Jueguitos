"use client";

import {
  castDuelVoteSchema,
  duelPayloadSchema,
  duelVoteResultSchema,
  roundSummarySchema,
  type BusinessItem,
  type DuelPayload,
  type DuelVoteResult,
  type RoundSummary,
} from "@mvp/domain";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BusinessImage } from "@/components/business-image";
import type { PublicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type GameStatus =
  | "catalogComplete"
  | "catalogEmpty"
  | "error"
  | "loading"
  | "ready"
  | "result"
  | "roundComplete"
  | "voting";

type DuelGameProps = {
  environment: PublicEnvironment;
  showIntroduction: boolean;
};

const COMMUNITY_THRESHOLD = 5;

function orderedItems(duel: DuelPayload | null): BusinessItem[] {
  if (!duel) return [];

  const items: [BusinessItem, BusinessItem] = [duel.first_item, duel.second_item];
  const checksum = [...duel.duel_id].reduce((total, character) => total + character.charCodeAt(0), 0);
  return checksum % 2 === 0 ? items : [items[1], items[0]];
}

function resultForItem(duel: DuelPayload, result: DuelVoteResult, itemId: string) {
  return itemId === duel.first_item.id
    ? { percentage: result.first_percentage, votes: result.first_votes }
    : { percentage: result.second_percentage, votes: result.second_votes };
}

function getResultMessage(showCommunityResult: boolean, selectedPercentage?: number) {
  if (!showCommunityResult) return null;
  if (selectedPercentage === 50) return "La comparación está empatada por ahora.";
  if (selectedPercentage && selectedPercentage > 50) {
    return "Tu elección va liderando la preferencia actual.";
  }

  return "Tu elección va contra la tendencia actual.";
}

export function DuelGame({ environment, showIntroduction }: DuelGameProps) {
  const [supabase] = useState(() => createClient(environment));
  const [duel, setDuel] = useState<DuelPayload | null>(null);
  const [introductionVisible, setIntroductionVisible] = useState(showIntroduction);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DuelVoteResult | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [status, setStatus] = useState<GameStatus>("loading");

  const items = useMemo(() => orderedItems(duel), [duel]);

  const loadRoundSummary = useCallback(async () => {
    const { data } = await supabase.rpc("get_current_round_summary");
    const parsed = roundSummarySchema.safeParse(data?.[0]);
    setRoundSummary(parsed.success ? parsed.data : null);
  }, [supabase]);

  const loadNextDuel = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    setResult(null);
    setSelectedItemId(null);

    const { data, error } = await supabase.rpc("create_next_duel");
    const parsed = duelPayloadSchema.safeParse(data?.[0]);

    if (error?.code === "P0002") {
      setDuel(null);
      setStatus("catalogEmpty");
      setMessage("Estamos preparando los primeros locales. Todavía no hay suficientes para iniciar un duelo.");
      return;
    }

    if (error?.code === "P0003") {
      setDuel(null);
      await loadRoundSummary();
      setStatus("roundComplete");
      return;
    }

    if (error?.code === "P0004") {
      setDuel(null);
      setStatus("catalogComplete");
      setMessage("Ya comparaste todas las parejas disponibles. El ranking guarda el resultado de tus decisiones.");
      return;
    }

    if (error || !parsed.success) {
      setDuel(null);
      setStatus("error");
      setMessage("No pudimos preparar el duelo. Comprueba tu conexión e inténtalo nuevamente.");
      return;
    }

    setRoundSummary(null);
    setDuel(parsed.data);
    setStatus("ready");
  }, [loadRoundSummary, supabase]);

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

      if (active) await loadNextDuel();
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
    if (!duel || status !== "ready") return;

    const vote = castDuelVoteSchema.safeParse({ duelId: duel.duel_id, winnerId });
    if (!vote.success) {
      setStatus("error");
      setMessage("No pudimos validar tu selección.");
      return;
    }

    setSelectedItemId(winnerId);
    setStatus("voting");

    const { data, error } = await supabase.rpc("cast_duel_vote", {
      p_duel_id: vote.data.duelId,
      p_winner_id: vote.data.winnerId,
    });
    const parsedResult = duelVoteResultSchema.safeParse(data?.[0]);

    if (error || !parsedResult.success) {
      setSelectedItemId(null);
      setStatus("error");
      setMessage("No pudimos confirmar ese voto. Prepara un duelo nuevo para continuar.");
      return;
    }

    setResult(parsedResult.data);
    setStatus("result");
  }

  async function startNewRound() {
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.rpc("start_new_round");

    if (error) {
      setStatus("error");
      setMessage("No pudimos iniciar otra ronda. Inténtalo nuevamente.");
      return;
    }

    await loadNextDuel();
  }

  if (introductionVisible) {
    return (
      <main className="game-page">
        <section className="game-introduction" aria-labelledby="introduction-title">
          <p className="eyebrow">Tu primera ronda</p>
          <h1 id="introduction-title">Elige el nombre que más te guste</h1>
          <p className="lede">
            Verás dos locales reales de Santiago. Toca uno, descubre la tendencia y continúa mientras
            te entretenga.
          </p>
          <ul>
            <li>No hay respuestas correctas.</li>
            <li>Cada ronda tiene hasta 10 duelos.</li>
            <li>Tu correo nunca aparece en el ranking.</li>
          </ul>
          <button className="button" onClick={() => void completeIntroduction()} type="button">
            Entendido, comenzar
          </button>
        </section>
      </main>
    );
  }

  const totalVotes = result ? result.first_votes + result.second_votes : 0;
  const showCommunityResult = totalVotes >= COMMUNITY_THRESHOLD;
  const selectedResult = duel && result && selectedItemId
    ? resultForItem(duel, result, selectedItemId)
    : null;
  const resultMessage = getResultMessage(showCommunityResult, selectedResult?.percentage)
    ?? `Eres de las primeras personas en votar esta pareja. Ya van ${totalVotes}.`;
  const preferenceItems = duel && result
    ? items.map((item) => ({ item, result: resultForItem(duel, result, item.id) }))
    : [];

  return (
    <main className="game-page">
      {duel ? (
        <header className="game-header" aria-labelledby="game-title">
          <div>
            <p className="game-kicker">¿Cuál tiene mejor nombre?</p>
            <h1 className="visually-hidden" id="game-title">Duelo de nombres de locales</h1>
            <p className="game-progress-label">Duelo {duel.round_position} de {duel.round_size}</p>
          </div>
          <div
            aria-label={`Duelo ${duel.round_position} de ${duel.round_size}`}
            aria-valuemax={duel.round_size}
            aria-valuemin={1}
            aria-valuenow={duel.round_position}
            className="game-progress"
            role="progressbar"
          >
            <span style={{ width: `${(duel.round_position / duel.round_size) * 100}%` }} />
          </div>
        </header>
      ) : null}

      {duel && (status === "ready" || status === "voting") ? (
        <section aria-busy={status === "voting"} aria-label="Elige una de las dos opciones" className="duel-grid">
          {items.map((item, index) => {
            const selected = selectedItemId === item.id;
            const dimmed = status === "voting" && !selected;
            return (
              <button
                aria-pressed={selected}
                className={`duel-card${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}`}
                disabled={status === "voting"}
                key={item.id}
                onClick={() => void castVote(item.id)}
                type="button"
              >
                <span className="duel-image-wrap">
                  <BusinessImage
                    alt={`Fachada o letrero de ${item.name}`}
                    className="duel-image"
                    name={item.name}
                    priority={index < 2}
                    sizes="(max-width: 560px) 44vw, 420px"
                    src={item.imageUrl}
                  />
                  {selected ? <span className="choice-badge">Tu elección ✓</span> : null}
                </span>
                <span className="duel-card-copy">
                  <span className="duel-name">{item.name}</span>
                  <span className="duel-meta">{item.city}</span>
                </span>
              </button>
            );
          })}
          {status === "voting" ? <p className="vote-status" role="status">Registrando tu elección…</p> : null}
        </section>
      ) : status === "result" && duel && result ? (
        <section aria-live="polite" aria-labelledby="result-title" className="duel-result">
          <div className="result-heading">
            <p className="eyebrow">Voto registrado</p>
            <h2 id="result-title">{resultMessage}</h2>
          </div>

          <div className="result-grid">
            {items.map((item, index) => {
              const itemResult = resultForItem(duel, result, item.id);
              const selected = selectedItemId === item.id;
              return (
                <article className={`result-card${selected ? " is-selected" : ""}`} key={item.id}>
                  <span className="duel-image-wrap">
                    <BusinessImage
                      alt={`Fachada o letrero de ${item.name}`}
                      className="duel-image"
                      name={item.name}
                      priority={index < 2}
                      sizes="(max-width: 560px) 44vw, 420px"
                      src={item.imageUrl}
                    />
                    {selected ? <span className="choice-badge">Tu elección ✓</span> : null}
                  </span>
                  <div className="result-card-content">
                    <span className="duel-name">{item.name}</span>
                    <span className="duel-meta">{item.city}</span>
                    {showCommunityResult ? <strong>{itemResult.percentage}%</strong> : null}
                    <small>{itemResult.votes} {itemResult.votes === 1 ? "voto" : "votos"}</small>
                  </div>
                </article>
              );
            })}
          </div>

          {showCommunityResult ? (
            <div
              aria-label={preferenceItems
                .map(({ item, result: itemResult }) => `${itemResult.percentage}% para ${item.name}`)
                .join(" y ")}
              className="preference-summary"
              role="img"
            >
              <div className="preference-labels">
                {preferenceItems.map(({ item }) => <span key={item.id}>{item.name}</span>)}
              </div>
              <div className="preference-bar">
                {preferenceItems.map(({ item, result: itemResult }, index) => (
                  <span
                    className={index === 0 ? "preference-first" : "preference-second"}
                    key={item.id}
                    style={{ width: `${itemResult.percentage}%` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="early-result">Mostraremos el porcentaje cuando esta pareja alcance {COMMUNITY_THRESHOLD} votos.</p>
          )}

          <button className="button button-wide" onClick={() => void loadNextDuel()} type="button">
            Siguiente duelo
          </button>
        </section>
      ) : status === "roundComplete" ? (
        <section aria-live="polite" className="round-summary">
          <p className="eyebrow">Ronda completada</p>
          <h1>{roundSummary ? `Tomaste ${roundSummary.votes_cast} decisiones.` : "Completaste la ronda."}</h1>
          <p className="lede">Tus votos ya actualizaron el ranking de los locales. Puedes seguir jugando sin esperar.</p>
          <div className="round-actions">
            <button className="button" onClick={() => void startNewRound()} type="button">Jugar otra ronda</button>
            <Link className="button button-secondary" href="/ranking">Ver ranking</Link>
            <Link className="text-link" href="/aportes/nuevo">Aportar un local</Link>
          </div>
        </section>
      ) : (
        <section aria-live="polite" className="game-status">
          <p>{status === "loading" ? "Preparando el siguiente duelo…" : message}</p>
          <div className="status-actions">
            {status === "error" || status === "catalogEmpty" ? (
              <button className="button" onClick={() => void loadNextDuel()} type="button">Revisar de nuevo</button>
            ) : null}
            {status === "catalogEmpty" || status === "catalogComplete" ? (
              <Link className="button button-secondary" href="/ranking">Ver ranking</Link>
            ) : null}
            {status === "catalogEmpty" ? <Link className="text-link" href="/aportes/nuevo">Aportar un local</Link> : null}
          </div>
        </section>
      )}
    </main>
  );
}
