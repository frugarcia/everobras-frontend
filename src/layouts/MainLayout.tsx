import {NavLink, Outlet} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Building2,
  HardHat,
  Package,
  Wrench,
  Truck,
  Users,
  UserCog,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

const navigation = [
  {name: "Dashboard", icon: LayoutDashboard, href: "/"},
  {name: "Albaranes", icon: FileText, href: "/albaranes"},
];

const maintenance = [
  {name: "Clientes", icon: Building2, href: "/mantenimiento/clientes"},
  {name: "Obras", icon: HardHat, href: "/mantenimiento/obras"},
  {name: "Materiales", icon: Package, href: "/mantenimiento/materiales"},
  {name: "Servicios", icon: Wrench, href: "/mantenimiento/servicios"},
  {name: "Vehículos", icon: Truck, href: "/mantenimiento/vehiculos"},
  {name: "Operarios", icon: Users, href: "/mantenimiento/operarios"},
  {name: "Usuarios", icon: UserCog, href: "/mantenimiento/usuarios"},
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {user, logout} = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between lg:justify-center border-b px-6">
          <Logo className="h-20 w-auto py-2" />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({isActive}) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mantenimiento
            </p>
            <div className="space-y-1">
              {maintenance.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({isActive}) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User info + Logout */}
        <div className="border-t p-4">
          <div className="mb-2 px-3 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
