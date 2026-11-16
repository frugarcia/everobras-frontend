import type {ReactNode} from "react";
import {CheckCircle2Icon} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/Logo";

const FEATURES = [
  "Gestión de albaranes internos y externos",
  "Clientes, obras y operarios en un solo lugar",
  "Control de albaranes firmados y pendientes",
];

export default function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-secondary-blue/15 via-secondary-blue/25 to-primary/15 px-8 py-10 md:w-1/2 md:py-12">
        <div className="pointer-events-none absolute -top-30 -right-20 size-70 rounded-full bg-secondary-blue/20" />
        <div className="pointer-events-none absolute -bottom-35 -left-25 size-80 rounded-full bg-primary/10" />
        <div className="pointer-events-none absolute top-1/3 -left-16 hidden size-40 rounded-full bg-secondary-blue/15 md:block" />

        <div className="relative flex max-w-md flex-col items-center gap-4 text-center md:gap-8">
          <div className="flex flex-col items-center gap-3">
            <Logo className="h-28 w-auto md:h-40" />
            <p className="text-xs font-medium tracking-widest text-primary uppercase md:text-sm">
              Gestión de albaranes y partes de obra
            </p>
          </div>
          <ul className="hidden flex-col gap-3 text-left md:flex">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-primary"
              >
                <CheckCircle2Icon className="size-5 shrink-0 text-secondary-blue" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="absolute bottom-6 hidden text-xs text-primary/70 md:block">
          © {new Date().getFullYear()} Everobras
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10 md:w-1/2">
        <Card className="w-full max-w-sm shadow-lg [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </section>
    </div>
  );
}
