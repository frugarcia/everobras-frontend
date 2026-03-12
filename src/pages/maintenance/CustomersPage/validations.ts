import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  cif: z.string().min(1, "El CIF es obligatorio"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
