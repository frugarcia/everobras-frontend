import {useState} from "react";
import {Link} from "react-router-dom";
import {authApi} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {HardHat, ArrowLeft, Mail} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Error al enviar el email. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <HardHat className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Everobras</h1>
            <p className="text-sm text-slate-400">
              Recuperar contraseña
            </p>
          </div>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-center text-sm text-slate-300">
                Si existe una cuenta con el email <strong className="text-white">{email}</strong>,
                recibirás un enlace para restablecer tu contraseña.
              </p>
            </div>
            <Link to="/login">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <p className="text-sm text-slate-400">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="mr-1 inline h-3 w-3" />
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
