import axios from "axios";

/** Extrae el mensaje `{error}` que devuelve la API, con un texto por defecto. */
export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return String(error.response.data.error);
  }
  return fallback;
}
