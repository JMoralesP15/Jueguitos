"use client";

export type SubmissionActionState = {
  fieldErrors?: {
    address?: string;
    category?: string;
    city?: string;
    location?: string;
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
