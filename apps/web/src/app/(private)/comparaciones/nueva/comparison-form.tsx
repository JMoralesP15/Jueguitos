"use client";

import { useActionState } from "react";

import {
  initialComparisonActionState,
  type ComparisonFormAction,
} from "@/lib/comparisons/form-state";

type ComparisonFormProps = {
  action: ComparisonFormAction;
};

export function ComparisonForm({ action }: ComparisonFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialComparisonActionState);

  return (
    <form action={formAction} className="comparison-form" noValidate>
      <div className="form-heading">
        <p className="eyebrow">MVP-002</p>
        <h1>Crear comparación</h1>
        <p className="lede">Guárdala primero como borrador. Más adelante podrás publicarla para recibir votos.</p>
      </div>

      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}

      <div className="field-group">
        <label htmlFor="title">Pregunta o título</label>
        <input aria-describedby={state.fieldErrors?.title ? "title-error" : "title-help"} aria-invalid={Boolean(state.fieldErrors?.title)} id="title" maxLength={120} minLength={3} name="title" required />
        <p className="field-help" id="title-help">Entre 3 y 120 caracteres.</p>
        {state.fieldErrors?.title ? <p className="field-error" id="title-error">{state.fieldErrors.title}</p> : null}
      </div>

      <div className="field-group">
        <label htmlFor="description">Contexto opcional</label>
        <textarea aria-describedby={state.fieldErrors?.description ? "description-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.description)} id="description" maxLength={1000} name="description" rows={4} />
        {state.fieldErrors?.description ? <p className="field-error" id="description-error">{state.fieldErrors.description}</p> : null}
      </div>

      <fieldset className="comparison-options">
        <legend>Opciones</legend>
        <div className="field-group">
          <label htmlFor="firstOption">Opción A</label>
          <input aria-describedby={state.fieldErrors?.firstOption ? "first-option-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.firstOption)} id="firstOption" maxLength={80} minLength={2} name="firstOption" required />
          {state.fieldErrors?.firstOption ? <p className="field-error" id="first-option-error">{state.fieldErrors.firstOption}</p> : null}
        </div>
        <div className="field-group">
          <label htmlFor="secondOption">Opción B</label>
          <input aria-describedby={state.fieldErrors?.secondOption ? "second-option-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.secondOption)} id="secondOption" maxLength={80} minLength={2} name="secondOption" required />
          {state.fieldErrors?.secondOption ? <p className="field-error" id="second-option-error">{state.fieldErrors.secondOption}</p> : null}
        </div>
      </fieldset>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Guardando…" : "Guardar borrador"}
      </button>
    </form>
  );
}
