import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseZodErrorsToMessages(errors: {message: string}[]) {
  return errors.map((error) => error.message).join(", ");
}
