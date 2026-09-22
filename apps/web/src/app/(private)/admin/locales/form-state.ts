import type { AdminLocalActionState } from "./actions";

export const initialAdminLocalActionState: AdminLocalActionState = {};
export type AdminLocalFormAction = (
  previousState: AdminLocalActionState,
  formData: FormData,
) => Promise<AdminLocalActionState>;
