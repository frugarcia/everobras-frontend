/**
 * Adapta el estado de un campo de TanStack Form a las props
 * `isInvalid` / `errorMessage` de AppInput y AppSelect.
 */
export function fieldErrorProps(field: {
  state: {meta: {isValid: boolean; errors: unknown[]}};
}) {
  const messages = field.state.meta.errors
    .map((error) =>
      typeof error === "string"
        ? error
        : (error as {message?: string} | undefined)?.message,
    )
    .filter(Boolean);
  return {
    isInvalid: !field.state.meta.isValid,
    errorMessage: messages.join(", "),
  };
}
