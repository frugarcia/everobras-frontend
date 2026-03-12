import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
