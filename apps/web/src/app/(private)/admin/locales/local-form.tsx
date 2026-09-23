"use client";

import { businessCategories } from "@mvp/domain";
import { useActionState, useEffect, useRef } from "react";

import { initialAdminLocalActionState, type AdminLocalFormAction } from "./form-state";

type LocalFormProps = { action: AdminLocalFormAction };

export function LocalForm({ action }: LocalFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialAdminLocalActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} className="admin-local-form" encType="multipart/form-data" noValidate ref={formRef}>
      {state.message ? <p className={state.success ? "notice" : "form-message"} role={state.success ? "status" : "alert"}>{state.message}</p> : null}

      <div className="admin-local-grid">
        <div className="field-group">
          <label htmlFor="admin-local-name">Nombre del local</label>
          <input aria-invalid={Boolean(state.fieldErrors?.name)} id="admin-local-name" maxLength={120} name="name" placeholder="Ej.: La Picá de Siempre" required />
          {state.fieldErrors?.name ? <p className="field-error">{state.fieldErrors.name}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="admin-local-category">Rubro</label>
          <select aria-invalid={Boolean(state.fieldErrors?.category)} defaultValue="" id="admin-local-category" name="category" required>
            <option disabled value="">Elige un rubro</option>
            {businessCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {state.fieldErrors?.category ? <p className="field-error">{state.fieldErrors.category}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="admin-local-city">Comuna</label>
          <input aria-invalid={Boolean(state.fieldErrors?.city)} id="admin-local-city" maxLength={80} name="city" placeholder="Ej.: Ñuñoa" required />
          {state.fieldErrors?.city ? <p className="field-error">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="admin-local-address">Dirección (opcional)</label>
          <input aria-invalid={Boolean(state.fieldErrors?.address)} id="admin-local-address" maxLength={200} name="address" placeholder="Ej.: Av. Italia 1234" />
          {state.fieldErrors?.address ? <p className="field-error">{state.fieldErrors.address}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="admin-local-instagram">Instagram (opcional)</label>
          <input aria-invalid={Boolean(state.fieldErrors?.instagramUrl)} id="admin-local-instagram" name="instagramUrl" placeholder="https://instagram.com/local" type="url" />
          {state.fieldErrors?.instagramUrl ? <p className="field-error">{state.fieldErrors.instagramUrl}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="admin-local-website">Página web (opcional)</label>
          <input aria-invalid={Boolean(state.fieldErrors?.websiteUrl)} id="admin-local-website" name="websiteUrl" placeholder="https://local.cl" type="url" />
          {state.fieldErrors?.websiteUrl ? <p className="field-error">{state.fieldErrors.websiteUrl}</p> : null}
        </div>
      </div>

      <div className="field-group photo-dropzone">
        <label htmlFor="admin-local-photo">Foto del letrero con el nombre visible</label>
        <input accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(state.fieldErrors?.photo)} id="admin-local-photo" name="photo" required type="file" />
        <p className="field-help">El letrero debe permitir leer el nombre que se comparará. JPG, PNG o WebP; máximo 5 MB. Usa fotos propias o con autorización.</p>
        {state.fieldErrors?.photo ? <p className="field-error">{state.fieldErrors.photo}</p> : null}
      </div>

      <button className="button" disabled={isPending} type="submit">{isPending ? "Guardando…" : "Guardar local pendiente"}</button>
    </form>
  );
}
