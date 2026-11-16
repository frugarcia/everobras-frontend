import {useState} from "react";
import {Link} from "react-router-dom";
import {toast} from "sonner";
import {MailIcon} from "lucide-react";
import {authApi} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {Spinner} from "@/components/ui/spinner";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("No se ha podido enviar el enlace. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para crear una contraseña nueva"
    >
      {sent ? (
        <div className="flex flex-col gap-4 text-sm">
          <p>
            Si existe una cuenta con el email <strong>{email}</strong>, se ha
            enviado un enlace para restablecer la contraseña. Caduca en 1 hora.
          </p>
          <Link to="/login" className="text-sm text-primary underline">
            Volver al acceso
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="Introduzca el email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? "Enviando…" : "Enviar enlace"}
            </Button>
            <Link
              to="/login"
              className="block text-center text-sm text-primary underline"
            >
              Volver al acceso
            </Link>
          </FieldGroup>
        </form>
      )}
    </AuthShell>
  );
}
