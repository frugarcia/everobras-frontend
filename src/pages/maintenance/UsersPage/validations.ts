import {z} from "zod";

export const userSchema = z.object({
  email: z.string().email({message: "El email es obligatorio"}),
  password: z
    .string()
    .min(4, {message: "La contraseña debe tener al menos 4 caracteres"}),
  name: z.string().min(1, {message: "El nombre es obligatorio"}),
});
