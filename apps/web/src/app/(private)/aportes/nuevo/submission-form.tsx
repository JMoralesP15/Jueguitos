"use client";

import { businessCategories } from "@mvp/domain";
import { useActionState } from "react";

import { initialSubmissionActionState, type SubmissionFormAction } from "@/lib/submissions/form-state";

type SubmissionFormProps = { action: SubmissionFormAction };

export function SubmissionForm({ action }: SubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialSubmissionActionState);

  return (
    <form action={formAction} className="submission-form" noValidate>
      <div className="form-heading">
        <p className="eyebrow">Aporte privado · MVP-004</p>
        <h1>Agregar un local</h1>
        <p className="lede">Tu aporte queda en revisión. No aparecerá en el juego hasta aprobarlo.</p>
      </div>

      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}

      <div className="field-group">
        <label htmlFor="name">Nombre del local</label>
        <input aria-invalid={Boolean(state.fieldErrors?.name)} id="name" maxLength={120} name="name" required />
        {state.fieldErrors?.name ? <p className="field-error">{state.fieldErrors.name}</p> : null}
      </div>

      <div className="field-group">
        <label htmlFor="category">Categoría</label>
        <select aria-invalid={Boolean(state.fieldErrors?.category)} defaultValue="" id="category" name="category" required>
          <option disabled value="">Selecciona una categoría</option>
          {businessCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
      </div>

      <div className="field-group">
        <label htmlFor="city">Ciudad</label>
        <input aria-invalid={Boolean(state.fieldErrors?.city)} id="city" maxLength={80} name="city" placeholder="Ej.: Santiago" required />
        {state.fieldErrors?.city ? <p className="field-error">{state.fieldErrors.city}</p> : null}
      </div>

      <div className="field-group">
        <label htmlFor="photo">Foto propia del local</label>
        <input accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.fieldErrors?.photo)} id="photo" name="photo" required type="file" />
        <p className="field-help">JPG, PNG o WebP; máximo 5 MB. Sólo sube fotos que puedas usar.</p>
        {state.fieldErrors?.photo ? <p className="field-error">{state.fieldErrors.photo}</p> : null}
      </div>

      <button className="button" disabled={isPending} type="submit">{isPending ? "Enviando…" : "Enviar a revisión"}</button>
    </form>
  );
}
