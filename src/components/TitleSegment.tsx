import {ROUTES} from "@/config/routes";

export default function TitleSegment({path}: {path: string}) {
  const route = ROUTES.find((item) => item.path === path);

  if (!route) {
    console.warn(`TitleSegment: la ruta "${path}" no existe`);
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <route.icon size={22} className="text-primary" />
      <h1 className="text-2xl font-semibold text-foreground">{route.label}</h1>
    </div>
  );
}
