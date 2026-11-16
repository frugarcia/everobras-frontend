import {useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {LockIcon} from "lucide-react";
import {authApi} from "@/lib/api";
import {getErrorMessage} from "@/lib/errors";
import {Button} from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {Spinner} from "@/components/ui/spinner";
import AuthShell from "@/components/AuthShell";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Error al restablecer la contraseña. El enlace puede haber expirado.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Enlace no válido"
        description="Asegúrate de usar el enlace completo del email"
      >
        <Link to="/login" className="text-sm text-primary underline">
          Volver al acceso
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      description="Establece la contraseña para acceder a Everobras"
    >
      {success ? (
        <div className="flex flex-col gap-4 text-sm">
          <p>
            Tu contraseña se ha establecido correctamente. Serás redirigido al
            acceso en unos segundos…
          </p>
          <Link to="/login" className="text-sm text-primary underline">
            Ir al acceso
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type="password"
                  autoFocus
                  autoComplete="new-password"
                  placeholder="Introduzca la contraseña"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </Field>
            <Field data-invalid={Boolean(error) || undefined}>
              <FieldLabel htmlFor="confirmPassword">
                Confirmar contraseña
              </FieldLabel>
              <InputGroup className="h-9">
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita la contraseña"
                  required
                  aria-invalid={Boolean(error)}
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </InputGroup>
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? "Guardando…" : "Establecer contraseña"}
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthShell>
  );
}
