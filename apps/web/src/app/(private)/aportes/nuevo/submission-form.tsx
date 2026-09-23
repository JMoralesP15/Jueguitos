"use client";

import { businessCategories } from "@mvp/domain";
import { useActionState, useEffect, useState } from "react";

import { initialSubmissionActionState, type SubmissionFormAction, type SubmissionFormValues } from "@/lib/submissions/form-state";
import { readSubmissionDraft, writeSubmissionDraft, type SubmissionDraft } from "@/lib/submissions/draft";

import { MapPicker } from "./map-picker";

type SubmissionFormProps = { action: SubmissionFormAction };

export function SubmissionForm({ action }: SubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialSubmissionActionState);
  const [draft, setDraft] = useState<SubmissionDraft>(() => readSubmissionDraft());

  useEffect(() => {
    if (!state.values) return;
    writeSubmissionDraft(state.values);
  }, [state.values]);

  function updateDraft(field: keyof SubmissionDraft, value: string) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      writeSubmissionDraft({ [field]: value });
      return next;
    });
  }

  const effectiveDraft = { ...state.values, ...draft };
  const value = (field: keyof SubmissionFormValues) => effectiveDraft[field] ?? "";

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
          <input aria-invalid={Boolean(state.fieldErrors?.name)} autoComplete="organization" id="name" maxLength={120} name="name" onChange={(event) => updateDraft("name", event.target.value)} placeholder="Ej.: La Olla de Oro" required value={value("name")} />
          {state.fieldErrors?.name ? <p className="field-error">{state.fieldErrors.name}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="category">¿Qué vibra tiene?</label>
          <select aria-invalid={Boolean(state.fieldErrors?.category)} id="category" name="category" onChange={(event) => updateDraft("category", event.target.value)} required value={value("category")}>
            <option disabled value="">Elige una categoría</option>
            {businessCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
        </div>
      </section>

      <section className="submission-step" aria-labelledby="location-title">
        <div className="step-heading"><span>02</span><div><p className="eyebrow">El lugar</p><h2 id="location-title">Ponlo en el mapa.</h2></div></div>
        <div className="field-group">
          <label htmlFor="city">Comuna</label>
          <input aria-invalid={Boolean(state.fieldErrors?.city)} autoComplete="address-level2" id="city" maxLength={80} name="city" onChange={(event) => updateDraft("city", event.target.value)} placeholder="Ej.: Ñuñoa" required value={value("city")} />
          <p className="field-help">Durante la prueba cerrada todos los locales pertenecen a Santiago.</p>
          {state.fieldErrors?.city ? <p className="field-error">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="address">Dirección o referencia</label>
          <input aria-invalid={Boolean(state.fieldErrors?.address)} autoComplete="street-address" id="address" maxLength={200} name="address" onChange={(event) => updateDraft("address", event.target.value)} placeholder="Ej.: Av. Providencia 1234, frente al metro" required value={value("address")} />
          <p className="field-help">La usaremos para que otras personas puedan visitarlo cuando sea aprobado.</p>
          {state.fieldErrors?.address ? <p className="field-error">{state.fieldErrors.address}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="websiteUrl">Página web (opcional)</label>
          <input aria-invalid={Boolean(state.fieldErrors?.websiteUrl)} id="websiteUrl" name="websiteUrl" onChange={(event) => updateDraft("websiteUrl", event.target.value)} placeholder="https://ejemplo.cl" type="url" value={value("websiteUrl")} />
          {state.fieldErrors?.websiteUrl ? <p className="field-error">{state.fieldErrors.websiteUrl}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="instagramUrl">Instagram (opcional)</label>
          <input aria-invalid={Boolean(state.fieldErrors?.instagramUrl)} id="instagramUrl" name="instagramUrl" onChange={(event) => updateDraft("instagramUrl", event.target.value)} placeholder="https://instagram.com/ejemplo" type="url" value={value("instagramUrl")} />
          {state.fieldErrors?.instagramUrl ? <p className="field-error">{state.fieldErrors.instagramUrl}</p> : null}
        </div>

        <MapPicker />
        {state.fieldErrors?.location ? <p className="field-error">{state.fieldErrors.location}</p> : null}
      </section>

      <section className="submission-step photo-step" aria-labelledby="photo-title">
        <div className="step-heading"><span>03</span><div><p className="eyebrow">La foto</p><h2 id="photo-title">Muéstranos su personalidad.</h2></div></div>
        <div className="field-group photo-dropzone">
          <label htmlFor="photo">Elige una foto donde se lea el letrero</label>
          <input accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.fieldErrors?.photo)} id="photo" name="photo" required type="file" />
          <p className="field-help">El nombre del letrero debe verse con claridad: esa es la parte que la gente votará. JPG, PNG o WebP; máximo 5 MB. Sube sólo imágenes que tengas derecho a usar. Si aparece un error, los demás datos quedarán guardados; sólo tendrás que volver a elegir la foto.</p>
          {state.fieldErrors?.photo ? <p className="field-error">{state.fieldErrors.photo}</p> : null}
        </div>
      </section>

      <div className="submission-footer"><p>Tu hallazgo queda privado hasta la revisión.</p><button className="button" disabled={isPending} type="submit">{isPending ? "Enviando tu hallazgo…" : "Enviar mi hallazgo ✦"}</button></div>
    </form>
  );
}
