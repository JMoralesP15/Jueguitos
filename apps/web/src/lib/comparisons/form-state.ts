export type ComparisonFieldName = "title" | "description" | "firstOption" | "secondOption";

export type ComparisonActionState = {
  fieldErrors?: Partial<Record<ComparisonFieldName, string>>;
  message?: string;
};

export type ComparisonFormAction = (
  previousState: ComparisonActionState,
  formData: FormData,
) => Promise<ComparisonActionState>;

export const initialComparisonActionState: ComparisonActionState = {};
