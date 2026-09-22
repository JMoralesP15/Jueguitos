"use client";

export type SubmissionActionState = {
  fieldErrors?: {
    address?: string;
    category?: string;
    city?: string;
    location?: string;
    name?: string;
    photo?: string;
    instagramUrl?: string;
    websiteUrl?: string;
  };
  message?: string;
  values?: SubmissionFormValues;
};

export type SubmissionFormValues = {
  address: string;
  category: string;
  city: string;
  instagramUrl: string;
  latitude: string;
  locationAccuracyMeters: string;
  locationConfirmed: string;
  locationSource: string;
  longitude: string;
  name: string;
  websiteUrl: string;
};

export type SubmissionFormAction = (
  previousState: SubmissionActionState,
  formData: FormData,
) => Promise<SubmissionActionState>;

export const initialSubmissionActionState: SubmissionActionState = {};
