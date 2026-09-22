"use client";

import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return <button className="button" disabled={pending} type="submit">{pending ? "Publicando…" : `Aprobar las ${count} solicitudes`}</button>;
}

export function BulkApproveForm({ action, count }: { action: (formData: FormData) => Promise<void>; count: number }) {
  function confirmApproval(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Se publicarán ${count} locales y sus fotos quedarán visibles en el juego. ¿Continuar?`)) {
      event.preventDefault();
    }
  }

  return <form action={action} onSubmit={confirmApproval}><SubmitButton count={count} /></form>;
}
