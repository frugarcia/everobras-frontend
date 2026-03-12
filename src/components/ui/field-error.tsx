import {parseZodErrorsToMessages} from "@/lib/utils";

interface FieldErrorProps {
  field: {
    state: {
      meta: {
        isValid: boolean;
        errors: unknown[];
      };
    };
  };
}

export function FieldError({field}: FieldErrorProps) {
  if (field.state.meta.isValid) return null;

  return (
    <p className="text-sm text-destructive">
      {parseZodErrorsToMessages(
        field.state.meta.errors as {message: string}[],
      )}
    </p>
  );
}
