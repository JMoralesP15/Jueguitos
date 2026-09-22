"use client";

export const submissionDraftStorageKey = "jueguitos:submission-draft";

export type SubmissionDraft = {
  address?: string;
  category?: string;
  city?: string;
  instagramUrl?: string;
  latitude?: string;
  locationAccuracyMeters?: string;
  locationConfirmed?: string;
  locationSource?: string;
  longitude?: string;
  name?: string;
  websiteUrl?: string;
};

export function readSubmissionDraft(): SubmissionDraft {
  if (typeof window === "undefined") return {};

  try {
    const rawDraft = window.localStorage.getItem(submissionDraftStorageKey);
    return rawDraft ? (JSON.parse(rawDraft) as SubmissionDraft) : {};
  } catch {
    return {};
  }
}

export function writeSubmissionDraft(values: Partial<SubmissionDraft>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      submissionDraftStorageKey,
      JSON.stringify({ ...readSubmissionDraft(), ...values }),
    );
  } catch {
    // El formulario sigue funcionando aunque el navegador bloquee localStorage.
  }
}

export function clearSubmissionDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(submissionDraftStorageKey);
}
