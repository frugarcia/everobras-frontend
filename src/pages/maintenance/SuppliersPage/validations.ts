import {z} from "zod";

export const supplierSchema = z.object({
  commercialName: z.string().min(1, "El nombre comercial es obligatorio"),
  legalName: z.string().min(1, "La razón social es obligatoria"),
  cif: z.string().min(1, "El CIF es obligatorio"),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
