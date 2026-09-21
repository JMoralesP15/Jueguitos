export type AuthFieldName = "email" | "username" | "password";

export type AuthActionState = {
  fieldErrors?: Partial<Record<AuthFieldName, string>>;
  message?: string;
  success?: boolean;
};

export type AuthFormAction = (
  previousState: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

export const initialAuthActionState: AuthActionState = {};
