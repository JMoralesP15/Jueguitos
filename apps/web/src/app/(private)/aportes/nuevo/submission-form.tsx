"use client";

import { businessCategories } from "@mvp/domain";
import { useActionState } from "react";

import { initialSubmissionActionState, type SubmissionFormAction } from "@/lib/submissions/form-state";

import { MapPicker } from "./map-picker";

type SubmissionFormProps = { action: SubmissionFormAction };

export function SubmissionForm({ action }: SubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialSubmissionActionState);

  return (
    <form action={formAction} className="submission-form" noValidate>
      <div className="form-heading">
        <p className="eyebrow">Tu hallazgo · MVP-004</p>
        <h1>Haz que un local entre al juego.</h1>
        <p className="lede">Comparte un nombre que merezca ser descubierto. Lo revisaremos antes de mostrarlo a la comunidad.</p>
      </div>

      <ol className="submission-steps" aria-label="Pasos para aportar un local">
        <li><span>1</span> Cuéntanos</li>
        <li><span>2</span> Ubícalo</li>
        <li><span>3</span> Retrátalo</li>
      </ol>

      {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}

      <section className="submission-step" aria-labelledby="about-local-title">
        <div className="step-heading"><span>01</span><div><p className="eyebrow">El nombre</p><h2 id="about-local-title">¿Cómo se llama esta joyita?</h2></div></div>
        <div className="field-group">
          <label htmlFor="name">Nombre del local</label>
          <input aria-invalid={Boolean(state.fieldErrors?.name)} id="name" maxLength={120} name="name" placeholder="Ej.: La Olla de Oro" required />
          {state.fieldErrors?.name ? <p className="field-error">{state.fieldErrors.name}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="category">¿Qué vibra tiene?</label>
          <select aria-invalid={Boolean(state.fieldErrors?.category)} defaultValue="" id="category" name="category" required>
            <option disabled value="">Elige una categoría</option>
            {businessCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
        </div>
      </section>

      <section className="submission-step" aria-labelledby="location-title">
        <div className="step-heading"><span>02</span><div><p className="eyebrow">El lugar</p><h2 id="location-title">Ponlo en el mapa.</h2></div></div>
        <div className="field-group">
          <label htmlFor="city">Ciudad</label>
          <input aria-invalid={Boolean(state.fieldErrors?.city)} id="city" maxLength={80} name="city" placeholder="Ej.: Santiago" required />
          {state.fieldErrors?.city ? <p className="field-error">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="address">Dirección o referencia</label>
          <input aria-invalid={Boolean(state.fieldErrors?.address)} id="address" maxLength={200} name="address" placeholder="Ej.: Av. Providencia 1234, frente al metro" required />
          <p className="field-help">La usaremos para que otras personas puedan visitarlo cuando sea aprobado.</p>
          {state.fieldErrors?.address ? <p className="field-error">{state.fieldErrors.address}</p> : null}
        </div>

        <MapPicker />
        {state.fieldErrors?.location ? <p className="field-error">{state.fieldErrors.location}</p> : null}
      </section>

      <section className="submission-step photo-step" aria-labelledby="photo-title">
        <div className="step-heading"><span>03</span><div><p className="eyebrow">La foto</p><h2 id="photo-title">Muéstranos su personalidad.</h2></div></div>
        <div className="field-group photo-dropzone">
          <label htmlFor="photo">Elige una foto propia del local</label>
          <input accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.fieldErrors?.photo)} id="photo" name="photo" required type="file" />
          <p className="field-help">JPG, PNG o WebP; máximo 5 MB. Sube sólo imágenes que tengas derecho a usar.</p>
          {state.fieldErrors?.photo ? <p className="field-error">{state.fieldErrors.photo}</p> : null}
        </div>
      </section>

      <div className="submission-footer"><p>Tu hallazgo queda privado hasta la revisión.</p><button className="button" disabled={isPending} type="submit">{isPending ? "Enviando tu hallazgo…" : "Enviar mi hallazgo ✦"}</button></div>
    </form>
  );
}
