import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
