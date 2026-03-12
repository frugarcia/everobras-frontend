import { z } from "zod";

export const workerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "Los apellidos son obligatorios"),
  dni: z.string().min(1, "El DNI es obligatorio"),
  email: z.string().min(1, "El email es obligatorio").email("El email no es válido"),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;
