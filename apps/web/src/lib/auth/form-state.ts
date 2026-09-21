export type AuthFieldName = "email" | "username" | "password";

export type AuthActionState = {
  email?: string;
  fieldErrors?: Partial<Record<AuthFieldName, string>>;
  message?: string;
  sentAt?: number;
  success?: boolean;
};

export type AuthFormAction = (
  previousState: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

export const initialAuthActionState: AuthActionState = {};
