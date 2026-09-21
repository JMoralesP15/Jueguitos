"use client";

import { useActionState } from "react";

import {
  updateDisplayNameAction,
  type ProfileActionState,
} from "./profile-actions";

const initialState: ProfileActionState = {};

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, formAction, isPending] = useActionState(updateDisplayNameAction, initialState);

  return (
    <form action={formAction} className="profile-form">
      <div className="field-group">
        <label htmlFor="display-name">Tu apodo</label>
        <input
          autoComplete="nickname"
          defaultValue={displayName}
          id="display-name"
          maxLength={32}
          name="display_name"
          placeholder="Por ejemplo, QueseraFan"
        />
        <p className="field-help">Es opcional y privado; tu correo no aparece en el juego.</p>
      </div>
      {state.message ? (
        <p className={state.success ? "notice" : "form-message"} role={state.success ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}
      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Guardando…" : "Guardar apodo"}
      </button>
    </form>
  );
}
