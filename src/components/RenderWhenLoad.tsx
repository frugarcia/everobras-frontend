import type {PropsWithChildren} from "react";
import {IconAlertTriangle} from "@tabler/icons-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import Loader from "@/components/Loader";
import {getErrorMessage} from "@/lib/errors";

function ErrorAlert({error}: {error: unknown}) {
  return (
    <Alert variant="destructive">
      <IconAlertTriangle />
      <AlertTitle>
        {getErrorMessage(
          error,
          "Se produjo un error de comunicación con el servidor",
        )}
      </AlertTitle>
      <AlertDescription>
        Pruebe a recargar la página o vuelva a intentarlo más tarde.
      </AlertDescription>
    </Alert>
  );
}

export default function RenderWhenLoad({
  isLoading,
  error,
  children,
}: PropsWithChildren & {
  isLoading: boolean;
  error?: unknown;
}) {
  if (isLoading) return <Loader />;
  if (error) return <ErrorAlert error={error} />;
  return children;
}
