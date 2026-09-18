"use client";

export type SubmissionActionState = {
  fieldErrors?: {
    category?: string;
    city?: string;
    name?: string;
    photo?: string;
  };
  message?: string;
};

export type SubmissionFormAction = (
  previousState: SubmissionActionState,
  formData: FormData,
) => Promise<SubmissionActionState>;

export const initialSubmissionActionState: SubmissionActionState = {};
