import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  customerId: z.string().min(1, "El cliente es obligatorio"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
