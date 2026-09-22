"use client";

import { useEffect } from "react";

import { clearSubmissionDraft } from "@/lib/submissions/draft";

export function SubmissionDraftCleanup() {
  useEffect(() => {
    clearSubmissionDraft();
  }, []);

  return null;
}
