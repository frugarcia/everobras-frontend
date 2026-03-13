import {z} from "zod";

export const userSchema = z.object({
  email: z.string().email({message: "El email es obligatorio"}),
  name: z.string().min(1, {message: "El nombre es obligatorio"}),
});
