import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {EyeIcon, EyeOffIcon, LockIcon, MailIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {Spinner} from "@/components/ui/spinner";
import {useAuth} from "@/hooks/useAuth";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setPassword("");
      toast.error("Error al hacer login: credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Acceder" description="Entra con tu email de Everobras">
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

          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <InputGroup className="h-9">
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                autoComplete="current-password"
                placeholder="Introduzca la contraseña"
                type={isVisible ? "text" : "password"}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setIsVisible((value) => !value)}
                  aria-label={
                    isVisible ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : null}
            {isLoading ? "Accediendo…" : "Acceder"}
          </Button>
          <Link
            to="/forgot-password"
            className="block text-center text-sm text-primary underline"
          >
            ¿Has olvidado tu contraseña?
          </Link>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
