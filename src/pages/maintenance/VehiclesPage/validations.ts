import { z } from "zod";

export const vehicleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  plate: z.string().min(1, "La matrícula es obligatoria"),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
