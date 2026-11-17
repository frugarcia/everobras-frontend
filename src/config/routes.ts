import {
  IconBuilding,
  IconBuildingStore,
  IconClipboardList,
  IconFileInvoice,
  IconFileText,
  IconHelmet,
  IconLayoutDashboard,
  IconPackage,
  IconTool,
  IconTruck,
  IconUserCog,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

export type TNavRoute = {
  path: string;
  label: string;
  icon: Icon;
  group: "main" | "maintenance";
};

/** Entradas del sidebar y títulos de sección (TitleSegment). */
export const ROUTES: TNavRoute[] = [
  {path: "/", label: "Inicio", icon: IconLayoutDashboard, group: "main"},
  {path: "/albaranes", label: "Albaranes de venta", icon: IconFileText, group: "main"},
  {path: "/proformas", label: "Proformas", icon: IconFileInvoice, group: "main"},
  {
    path: "/partes-internos",
    label: "Partes internos",
    icon: IconClipboardList,
    group: "main",
  },
  {
    path: "/mantenimiento/clientes",
    label: "Clientes",
    icon: IconBuilding,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/proveedores",
    label: "Proveedores",
    icon: IconBuildingStore,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/obras",
    label: "Obras",
    icon: IconHelmet,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/materiales",
    label: "Materiales",
    icon: IconPackage,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/servicios",
    label: "Servicios",
    icon: IconTool,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/vehiculos",
    label: "Vehículos",
    icon: IconTruck,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/operarios",
    label: "Operarios",
    icon: IconUsers,
    group: "maintenance",
  },
  {
    path: "/mantenimiento/usuarios",
    label: "Usuarios",
    icon: IconUserCog,
    group: "maintenance",
  },
];
